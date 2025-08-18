<?php

return [
    'java_path' => env('TABULA_JAVA', 'java'),
    'jar_path' => env('TABULA_JAR', base_path('bin/tabula/tabula.jar')),
    'timeout' => (int) env('TABULA_TIMEOUT', 300),
];