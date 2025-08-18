<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\TabulaExtractor;
use App\Services\PdfTextBbox;

class PdfVoteImportController extends Controller
{
    // Simple upload form
    public function index()
    {
        return view('import-votes');
    }

    public function store(Request $request)
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:30720'],
            'pages' => ['nullable', 'string'],
            'mode'  => ['nullable', 'in:lattice,stream'],
        ]);

        // Save to the default "local" disk (storage/app)
        $relativePath = $request->file('pdf')->store('pdfs'); // e.g. "pdfs/xxx.pdf"

        // If you used store('pdfs', 'public'), switch to Storage::disk('public')->path(...)
        $absolutePath = Storage::path($relativePath); // resolves to /var/www/html/storage/app/pdfs/xxx.pdf

        if (!file_exists($absolutePath)) {
            abort(500, "Uploaded file not found at: {$absolutePath}");
        }
        if (!is_readable($absolutePath)) {
            abort(500, "Uploaded file is not readable: {$absolutePath}");
        }

        $pages = $request->input('pages', 'all');
        $mode  = $request->input('mode', 'lattice');

        $tabula = TabulaExtractor::makeFromConfig();

        $tables = $tabula->toJson($absolutePath, $pages, $mode);

        return response()->json([
            'count' => count($tables),
            'data'  => $tables,
            'path'  => $absolutePath, // for debugging; remove later
        ]);
    }

    // Convert Tabula's cell objects into plain strings
    private function simplifyTabulaGrid(array $data): array
    {
        return array_map(function ($row) {
            return array_map(function ($cell) {
                $t = is_array($cell) ? ($cell['text'] ?? '') : (string) $cell;
                $t = preg_replace('/\s+/u', ' ', trim($t ?? '')) ?? '';
                return $t;
            }, $row);
        }, $data);
    }

    // Parse a single vote table like the ones in your screenshot.
    // Returns null if the grid doesn't look like a vote table.
    private function parseVoteTable(array $grid): ?array
    {
        if (empty($grid)) {
            return null;
        }

        // Known party abbreviations seen in your PDF
        $knownParties = ['PSD','CH','PS','IL','L','PCP','CDS-PP','BE','PAN','JPP'];

        // 1) Find the header row that contains party codes
        $headerIdx = null;
        $partyColIndex = []; // party => column index

        foreach ($grid as $i => $row) {
            $hits = [];
            foreach ($row as $j => $val) {
                if ($val !== '' && in_array($val, $knownParties, true)) {
                    $hits[$val] = $j;
                }
            }
            // Treat as header if we matched several party codes
            if (count($hits) >= 4) { // threshold can be adjusted
                $headerIdx = $i;
                $partyColIndex = $hits;
                break;
            }
        }

        if ($headerIdx === null || empty($partyColIndex)) {
            return null;
        }

        // 2) Locate vote rows by their labels (A FAVOR, CONTRA, ABSTENÇÃO)
        $favorIdx = $this->findRowIndex($grid, 'A FAVOR');
        $contraIdx = $this->findRowIndex($grid, 'CONTRA');
        $abstencaoIdx = $this->findRowIndex($grid, 'ABSTENÇÃO', ['ABSTENCAO']);

        if ($favorIdx === null || $contraIdx === null || $abstencaoIdx === null) {
            // Not the expected layout
            return null;
        }

        // 3) Optional: find "Resultado" on this table
        $resultado = null;
        [$ri, $rj] = $this->findCell($grid, 'Resultado') ?? [null, null];
        if ($ri !== null) {
            // pick the next non-empty cell on the same row, or the last non-empty on row
            $right = $this->firstNonEmptyRight($grid[$ri], $rj);
            $resultado = $right ?? null;
        }

        // 4) Build normalized votes per party from X marks
        $votes = [];
        foreach ($partyColIndex as $party => $colIdx) {
            $aFavor = $this->hasX($grid[$favorIdx][$colIdx] ?? '');
            $contra = $this->hasX($grid[$contraIdx][$colIdx] ?? '');
            $abst   = $this->hasX($grid[$abstencaoIdx][$colIdx] ?? '');

            // Ignore columns with no marks at all (optional)
            if (!$aFavor && !$contra && !$abst) {
                continue;
            }

            $votes[$party] = [
                'a_favor'    => $aFavor,
                'contra'     => $contra,
                'abstencao'  => $abst,
            ];
        }

        if (empty($votes)) {
            return null;
        }

        return [
            // If you also need the motion/proposal title, extract separately from page text.
            'resultado' => $resultado,
            'votes'     => $votes,
        ];
    }

    private function hasX(string $v): bool
    {
        $v = trim(Str::upper($v));
        // Some PDFs may produce "X", "x", or a special glyph; be permissive
        return $v === 'X' || $v === 'x' || $v === '✗' || $v === '✔' || $v === '■';
    }

    private function findRowIndex(array $grid, string $needle, array $altNeedles = []): ?int
    {
        $targets = array_merge([$needle], $altNeedles);
        foreach ($grid as $i => $row) {
            foreach ($row as $cell) {
                $t = $this->normalize($cell);
                foreach ($targets as $n) {
                    if ($t === $this->normalize($n)) {
                        return $i;
                    }
                }
            }
        }
        return null;
    }

    private function findCell(array $grid, string $needle): ?array
    {
        $n = $this->normalize($needle);
        foreach ($grid as $i => $row) {
            foreach ($row as $j => $cell) {
                if ($this->normalize($cell) === $n) {
                    return [$i, $j];
                }
            }
        }
        return null;
    }

    private function firstNonEmptyRight(array $row, int $fromCol): ?string
    {
        for ($j = $fromCol + 1; $j < count($row); $j++) {
            if (trim($row[$j]) !== '') {
                return trim($row[$j]);
            }
        }
        // fallback: last non-empty cell
        for ($j = count($row) - 1; $j >= 0; $j--) {
            if (trim($row[$j]) !== '') {
                return trim($row[$j]);
            }
        }
        return null;
    }

    private function normalize(string $s): string
    {
        $s = trim($s);
        // Remove accents for robust matching (ABSTENÇÃO -> ABSTENCAO)
        $s = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
        $s = strtoupper($s);
        $s = preg_replace('/\s+/', ' ', $s);
        return $s;
    }
}