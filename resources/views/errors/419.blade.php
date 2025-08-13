@extends('errors::modern')

@section('title', __('Sessão Expirada'))
@section('code', '419')
@section('message', __('Sua sessão expirou.'))
@section('description', 'Por favor, recarregue a página e tente novamente.')
