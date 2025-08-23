<?php

namespace App\Services;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class TabulaExtractor
{
    public function __construct(
        private readonly string $javaPath,
        private readonly string $jarPath,
        private readonly int $timeoutSeconds = 300
    ) {
        if (! file_exists($this->jarPath)) {
            throw new \RuntimeException("Tabula JAR not found at {$this->jarPath}");
        }
    }

    public static function makeFromConfig(): self
    {
        return new self(
            config('tabula.java_path', 'java'),
            config('tabula.jar_path'),
            (int) config('tabula.timeout', 300),
        );
    }

    /**
     * Extract tables to CSV (best for piping into further parsing).
     *
     * @param  string  $pdfPath  Absolute path to input PDF
     * @param  string  $outCsv  Absolute path to output CSV file
     * @param  string  $pages  e.g. "all", "1", "1-3", "1,3,5"
     * @param  string  $mode  "lattice" (lines) or "stream" (whitespace)
     * @param  string|null  $area  Optional area: "top,left,bottom,right" in points
     */
    public function toCsv(
        string $pdfPath,
        string $outCsv,
        string $pages = 'all',
        string $mode = 'lattice',
        ?string $area = null
    ): void {
        $args = [$this->javaPath, '-jar', $this->jarPath];

        // Mode flags
        if ($mode === 'lattice') {
            $args[] = '-l';
        } elseif ($mode === 'stream') {
            $args[] = '-s';
        }

        // Pages and format
        $args = array_merge($args, ['-p', $pages, '-f', 'CSV', '-o', $outCsv, $pdfPath]);

        // Optional area
        if ($area) {
            // e.g. "80,20,540,800"
            array_splice($args, 5, 0, ['-a', $area]);
        }

        $this->run($args);
    }

    /**
     * Extract tables to JSON and return decoded array.
     *
     * @return array<int, mixed>
     */
    public function toJson(
        string $pdfPath,
        string $pages = 'all',
        string $mode = 'lattice',
        ?string $area = null
    ): array {
        // Use a temp file to avoid huge stdout
        $tmp = tempnam(sys_get_temp_dir(), 'tabula_').'.json';
        $args = [$this->javaPath, '-jar', $this->jarPath];

        if ($mode === 'lattice') {
            $args[] = '-l';
        } elseif ($mode === 'stream') {
            $args[] = '-s';
        }

        if ($area) {
            $args = array_merge($args, ['-a', $area]);
        }

        $args = array_merge($args, ['-p', $pages, '-f', 'JSON', '-o', $tmp, $pdfPath]);

        $this->run($args);

        $json = file_get_contents($tmp) ?: '[]';
        @unlink($tmp);

        return json_decode($json, true) ?: [];
    }

    private function run(array $cmd): void
    {
        $process = new Process($cmd);
        $process->setTimeout($this->timeoutSeconds);

        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}
