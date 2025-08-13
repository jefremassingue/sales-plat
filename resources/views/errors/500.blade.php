@extends('errors::modern')

@section('title', __('Erro Interno do Servidor'))
@section('code', '500')
@section('message', __('Algo deu errado em nosso servidor.'))
@section('description', 'Nossos engenheiros foram notificados e estão trabalhando para resolver este problema.')
