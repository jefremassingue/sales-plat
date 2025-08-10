<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'private' => [
            'driver' => 'local',
            'root' => storage_path('app'),
            'throw' => false,
        ],
        'local' => [
            'driver' => 'local',
            'root' => public_path(),
            'url' => env('APP_URL') . '/storage',
            'throw' => false,
        ],
        'public' => [
            'driver' => 'local',
            'root' => public_path('files'),
            'url' => env('APP_URL') . '/storage',
            'visibility' => 'public',
            'throw' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

        'sftp' => [
            'driver' => 'sftp',
            'host' => env('FTP_HOST'),
            'username' => env('FTP_USERNAME'),
            'password' => env('FTP_PASSWORD'),
            'port' => 22, //env('FTP_PORT'),
            'root' => env('FTP_DATA_DIRECTORY')
        ],

    ],

    'default_video_storage' =>  env('DEFAULT_VIDEO_STORAGE', 'private'),
    'default_pocessed_video_storage' =>  env('DEFAULT_POCESSED_VIDEO_STORAGE', 'private'),
    'default_public_files_storage' =>  env('DEFAULT_PUBLIC_FILES_STORAGE', 'local'),
    'default_private_files_storage' =>  env('DEFAULT_PRIVATE_FILES_STORAGE', 'private'),

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
