<?php

namespace App\Console\Commands;

use App\Services\TabulaExtractor;
use Illuminate\Console\Command;

class ExtractPdfTables extends Command
{
    protected $signature = 'pdf:extract-tables
                            {pdf : Path to PDF}
                            {--out= : Output CSV path (if omitted, JSON is printed)}
                            {--pages=all : Pages to process}
                            {--mode=lattice : lattice|stream}
                            {--area= : Optional area "top,left,bottom,right" in points}';

    protected $description = 'Extract tables from a PDF using Tabula (tabula-java).';

    public function handle(): int
    {
        $pdf = $this->argument('pdf');
        $out = $this->option('out');
        $pages = $this->option('pages') ?: 'all';
        $mode = $this->option('mode') ?: 'lattice';
        $area = $this->option('area') ?: null;

        $extractor = TabulaExtractor::makeFromConfig();

        if ($out) {
            $extractor->toCsv($pdf, $out, $pages, $mode, $area);
            $this->info("CSV written to: {$out}");
        } else {
            $json = $extractor->toJson($pdf, $pages, $mode, $area);
            $this->line(json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        return self::SUCCESS;
    }
}
