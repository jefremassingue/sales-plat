<?php

namespace App\Enums;

enum CatalogStatus: string
{
    case AVAILABLE = 'available';
    case UNAVAILABLE = 'unavailable';
}
