<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    protected $guarded = [];
    protected $table = 'quiz_results';
    public $timestamps = false;
    public function user() { return $this->belongsTo(User::class, 'userId'); }
}
