@extends('errors::modern')

@section('title', __('Não Autorizado'))
@section('code', '401')
@section('message', __('Você precisa fazer login para acessar esta página.'))
@section('description', 'Esta página requer autenticação. Faça login e tente novamente.')
