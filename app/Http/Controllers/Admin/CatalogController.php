<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Catalog;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $catalogs = Catalog::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->orderBy('publish_year', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Catalogs/Index', [
            'catalogs' => $catalogs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Catalogs/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'file' => 'required|file|mimes:pdf|max:10240',
            'status' => 'required|in:available,unavailable',
            'version' => 'nullable|string|max:255',
            'publish_year' => 'nullable|digits:4|integer|min:1900|max:'.date('Y'),
        ]);

        $data['slug'] = Str::slug($data['title']);
        $data['user_id'] = auth()->id();

        if ($request->hasFile('cover')) {
            $data['cover'] = $request->file('cover')->store('catalogs/covers', 'public');
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('catalogs/files', 'public');
        }

        $catalog = Catalog::create($data);

        if ($request->hasFile('cover')) {
            $catalog->image()->create([
                'storage' => 'public',
                'path' => $data['cover'],
                'name' => basename($data['cover']),
                'original_name' => $request->file('cover')->getClientOriginalName(),
                'size' => $request->file('cover')->getSize(),
                'extension' => $request->file('cover')->getClientOriginalExtension(),
                'version' => 'original',
                'is_main' => true,
            ]);
        }

        return redirect()->route('admin.catalogs.index')->with('success', 'Catálogo criado com sucesso.');
    }

    public function show(Catalog $catalog)
    {
        return Inertia::render('Admin/Catalogs/Show', [
            'catalog' => $catalog->load('user'),
        ]);
    }

    public function edit(Catalog $catalog)
    {
        return Inertia::render('Admin/Catalogs/Edit', [
            'catalog' => $catalog,
        ]);
    }

    public function update(Request $request, Catalog $catalog)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'file' => 'nullable|file|mimes:pdf|max:10240',
            'status' => 'required|in:available,unavailable',
            'version' => 'nullable|string|max:255',
            'publish_year' => 'nullable|digits:4|integer|min:1900|max:'.date('Y'),
        ]);

        $data['slug'] = Str::slug($data['title']);

        if ($request->hasFile('cover')) {
            if ($catalog->cover) {
                Storage::disk('public')->delete($catalog->cover);
            }
            $data['cover'] = $request->file('cover')->store('catalogs/covers', 'public');

            if ($catalog->image) {
                $catalog->image->delete();
            }

            $catalog->image()->create([
                'storage' => 'public',
                'path' => $data['cover'],
                'name' => basename($data['cover']),
                'original_name' => $request->file('cover')->getClientOriginalName(),
                'size' => $request->file('cover')->getSize(),
                'extension' => $request->file('cover')->getClientOriginalExtension(),
                'version' => 'original',
                'is_main' => true,
            ]);
        } else {
            $data['cover'] = $catalog->cover;
        }

        if ($request->hasFile('file')) {
            if ($catalog->file) {
                Storage::disk('public')->delete($catalog->file);
            }
            $data['file'] = $request->file('file')->store('catalogs/files', 'public');
        }
        else {
            $data['file'] = $catalog->file;
        }

        $catalog->update($data);

        return redirect()->route('admin.catalogs.index')->with('success', 'Catálogo atualizado com sucesso.');
    }

    public function destroy(Catalog $catalog)
    {
        if ($catalog->cover) {
            Storage::disk('public')->delete($catalog->cover);
        }
        if ($catalog->file) {
            Storage::disk('public')->delete($catalog->file);
        }

        if ($catalog->image) {
            $catalog->image->delete();
        }

        $catalog->delete();

        return redirect()->route('admin.catalogs.index')->with('success', 'Catálogo removido com sucesso.');
    }
}