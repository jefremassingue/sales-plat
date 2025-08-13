@extends('errors::modern')

@section('title', __('Acesso Negado'))
@section('code', '403')
@section('message', __($exception->getMessage() ?: 'Você não tem permissão para acessar este recurso.'))
@section('description', 'Você não possui as permissões necessárias para visualizar esta página.')
