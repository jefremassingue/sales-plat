<?php


return [

    /*
    |--------------------------------------------------------------------------
    | Controllers Root Path
    |--------------------------------------------------------------------------
    |
    | This value specifies the root path where the package should look for
    | controller classes. By default, it is set to 'app/Http/Controllers'.
    |
    | Example: 'app/Http/Controllers'
    */

    'controllers_root_path' => env('SPG_CONTROLLERS_ROOT_PATH', 'app/Http/Controllers'),

    /*
    |--------------------------------------------------------------------------
    | Ignored Classes Files
    |--------------------------------------------------------------------------
    |
    | This value specifies a comma-separated list of controller classes or files
    | that should be ignored by the package. By default, it is set to 'Controller'.
    |
    | Example: 'Controller,Admin\PermissionGeneratorController,Helper\Upload'
    */

    'ignore_classes_files' => env('SPG_IGNORE_CLASSES_FILES', 'Controller'),

    /*
    |--------------------------------------------------------------------------
    | Controller Classes Suffixes
    |--------------------------------------------------------------------------
    |
    | This value specifies a comma-separated list of suffixes for controller
    | class names. By default, it is set to 'Controller'.
    |
    | Example: '_controller,Controller, Helper\Upload'
    */

    'controller_classes_suffixes' => env('SPG_CONTROLLER_CLASSES_SUFFIX', 'Controller'),

    /*
    |--------------------------------------------------------------------------
    | Ignored Methods and Functions
    |--------------------------------------------------------------------------
    |
    | This value specifies a comma-separated list of controller methods or functions
    | that should be ignored by the package. By default, it is set to '__construct'.
    |
    | Example: '__construct,pay'
    */

    'ignore_methods_and_functions' => env('SPG_IGNORE_METHODS_AND_FUNCTIONS', '__construct'),

    /*
    |--------------------------------------------------------------------------
    | Default Guard
    |--------------------------------------------------------------------------
    |
    | This value specifies the default guard that should be used when creating
    | the permissions. By default, it is set to 'web'.
    |
    | Example: 'api'
    */

    'default_guard' => env('SPG_DEFAULT_GUARD', 'web'),

];
