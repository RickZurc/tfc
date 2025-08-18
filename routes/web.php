<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\Process\Process;
use App\Http\Controllers\PdfVoteImportController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/import-votes', [PdfVoteImportController::class, 'index'])->name('votes.import.form');
Route::post('/import-votes', [PdfVoteImportController::class, 'store'])->name('votes.import.store');

Route::get('/test', function () {
    $parser = new \Smalot\PdfParser\Parser();
    $pdf = $parser->parseFile(resource_path('pdf-parlamento/XVII_1_13_2025-07-16_ResultadoVotacoes_2025-07-16.pdf'));

    $data = $pdf->getText();

    //get the Resultados
    preg_match_all('/Resultados\s*(.*?)\s*Votação/s', $data, $matches);
    $resultados = $matches[1] ?? [];

    // Process the resultados as needed
    foreach ($resultados as $resultado) {
        // Do something with each resultado
        preg_match_all('/(\d+)\s*-\s*(\d+)\s*Voto\s*([A-Z]+)/', $resultado, $voteMatches);
        $votos = $voteMatches[0] ?? [];
        foreach ($votos as $voto) {
            // Do something with each voto
            preg_match('/(\d+)\s*-\s*(\d+)\s*Voto\s*([A-Z]+)/', $voto, $matches);
            if ($matches) {
                $votoData = [
                    'id' => $matches[1],
                    'count' => $matches[2],
                    'type' => $matches[3],
                ];
                // Process the voto data as needed
                // For example, you could store it in a database or perform calculations but just show it
            }
        }

    }


    // $inputPdf = storage_path('app/votes.pdf');
    // $outputCsv = storage_path('app/votes.csv');

    // // Lattice mode is best for tables with ruling lines
    // $process = new Process([
    //     'java', '-jar', base_path('bin/tabula/tabula.jar'),
    //     '-l', // lattice mode
    //     '-p', 'all', // all pages
    //     '-f', 'CSV',
    //     '-o', $outputCsv,
    //     $inputPdf
    // ]);

    // $process->mustRun();

    // $csv = array_map('str_getcsv', file($outputCsv)); // parse CSV rows

    // return $csv;

})->name('test');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
