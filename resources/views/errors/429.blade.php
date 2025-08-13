@extends('errors::modern')

@section('title', __('Muitas Tentativas'))
@section('code', '429')
@section('message', __('Você fez muitas tentativas.'))
@section('description', 'Aguarde um momento antes de tentar novamente.')
