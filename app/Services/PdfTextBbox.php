<?php

namespace App\Services;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class PdfTextBbox
{
    public function __construct(
        private readonly string $pdftotextPath = 'pdftotext',
        private readonly int $timeoutSeconds = 120
    ) {}

    /**
     * Return lines for a specific page: each line has text and bbox [left, top, width, height].
     * Uses pdftotext -bbox-layout which outputs an HTML with absolute-positioned words/lines.
     *
     * @return array<int, array{left: float, top: float, width: float, height: float, text: string}>
     */
    public function getPageLines(string $pdfPath, int $page): array
    {
        if (!file_exists($pdfPath) || !is_readable($pdfPath)) {
            throw new \RuntimeException("PDF not readable: {$pdfPath}");
        }

        $tmpHtml = tempnam(sys_get_temp_dir(), 'bbox_').'.html';

        $cmd = [
            $this->pdftotextPath,
            '-bbox-layout',
            '-f', (string) $page,
            '-l', (string) $page,
            $pdfPath,
            $tmpHtml,
        ];

        $process = new Process($cmd);
        $process->setTimeout($this->timeoutSeconds);
        $process->run();

        if (!$process->isSuccessful()) {
            @unlink($tmpHtml);
            throw new ProcessFailedException($process);
        }

        $html = file_get_contents($tmpHtml) ?: '';
        @unlink($tmpHtml);

        return $this->parseBboxHtml($html);
    }

    /**
     * Parse pdftotext -bbox-layout HTML into line boxes.
     * This parser is tolerant to slight variations in Poppler output.
     */
    private function parseBboxHtml(string $html): array
    {
        $dom = new \DOMDocument();
        // suppress warnings due to HTML quirks
        @$dom->loadHTML($html);

        $xpath = new \DOMXPath($dom);

        // Poppler typically uses div.line with absolute style; fallback to spans with class "l"
        $lineNodes = $xpath->query('//div[contains(@class,"line")] | //span[contains(@class,"l")]');

        $lines = [];
        foreach ($lineNodes as $node) {
            /** @var \DOMElement $node */
            $style = $node->getAttribute('style');
            $bbox = $this->styleToBox($style);
            $text = trim($node->textContent ?? '');
            if ($text === '' || empty($bbox)) {
                // Reconstruct from child "word" nodes if needed
                $wordNodes = $xpath->query('.//*[contains(@class,"word")]', $node);
                $text = trim(implode(' ', array_map(fn($n) => trim($n->textContent ?? ''), iterator_to_array($wordNodes))));
                if ($text === '') {
                    continue;
                }
                if (empty($bbox)) {
                    // compute bbox from words
                    $coords = [];
                    foreach ($wordNodes as $w) {
                        $b = $this->styleToBox($w->getAttribute('style'));
                        if ($b) $coords[] = $b;
                    }
                    if ($coords) {
                        $left = min(array_column($coords, 'left'));
                        $top = min(array_column($coords, 'top'));
                        $right = max(array_map(fn($b) => $b['left'] + $b['width'], $coords));
                        $bottom = max(array_map(fn($b) => $b['top'] + $b['height'], $coords));
                        $bbox = [
                            'left' => $left,
                            'top' => $top,
                            'width' => $right - $left,
                            'height' => $bottom - $top,
                        ];
                    }
                }
            }

            if (!empty($bbox)) {
                $lines[] = array_merge($bbox, ['text' => preg_replace('/\s+/u', ' ', $text)]);
            }
        }

        // Sort by vertical position (top asc), then left
        usort($lines, function ($a, $b) {
            return $a['top'] <=> $b['top'] ?: $a['left'] <=> $b['left'];
        });

        return $lines;
    }

    private function styleToBox(string $style): array
    {
        // style: left:123; top:45; width:678; height:12; (units can be px or pt; we just compare consistently)
        $get = function (string $prop) use ($style): ?float {
            if (preg_match('/'.$prop.'\s*:\s*([0-9.]+)/i', $style, $m)) {
                return (float) $m[1];
            }
            return null;
        };

        $left = $get('left');
        $top = $get('top');
        $width = $get('width');
        $height = $get('height');

        if ($left === null || $top === null || $width === null || $height === null) {
            return [];
        }

        return compact('left','top','width','height');
    }
}