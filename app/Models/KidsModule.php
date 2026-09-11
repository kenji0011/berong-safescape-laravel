<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KidsModule extends Model
{
    protected $guarded = [];
    protected $table = 'kids_modules';

    protected static function booted()
    {
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::forget('active_kids_modules');
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::forget('active_kids_modules');
        });
    }

    public function progress() { return $this->hasMany(UserProgress::class, 'moduleId'); }
}
