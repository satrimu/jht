<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/app',
        __DIR__.'/bootstrap/app.php',
        __DIR__.'/config',
        __DIR__.'/database',
        __DIR__.'/public',
        __DIR__.'/routes',
    ])
    // ->withSkip([
    //     ReadOnlyPropertyRector::class,
    //     EncapsedStringsToSprintfRector::class,
    //     DisallowedEmptyRuleFixerRector::class,
    //     BooleanInBooleanNotRuleFixerRector::class,
    // ])
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
        typeDeclarations: true,
        privatization: true,
        earlyReturn: true,
        strictBooleans: true,
    )
    ->withPhpSets(php83: true)
    ->withImportNames()
    ->withSkip([
        // Skip vendor files
        __DIR__.'/vendor',

        // Skip test files for now (can be enabled later)
        __DIR__.'/tests',

        // Skip specific files that might cause issues
        __DIR__.'/app/Console/Commands/OptimizeSecurityLogs.php', // reference implementation
    ]);
