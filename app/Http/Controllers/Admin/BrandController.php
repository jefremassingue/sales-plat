<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BrandController extends Controller
{
    /**
     * Display the specified brand.
     */
    public function show(Brand $brand)
    {
        return Inertia::render('Admin/Brands/Show', [
            'brand' => $brand,
        ]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Brand::query();
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('slug', 'like', "%$search%")
                    ->orWhere('description', 'like', "%$search%");
            });
        }
        $brands = $query->orderBy('name')->paginate(15)->withQueryString();
        return Inertia::render('Admin/Brands/Index', [
            'brands' => $brands,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Brands/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|file|mimes:jpg,jpeg,png,svg,webp|max:2048',
        ]);
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $image = $request->file('logo');
            $logoPath = $image->store('brands', 'public');

            $brand = Brand::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'logo' => $logoPath,
            ]);
            Image::create([
                'version' => 'original',
                'storage' => 'public',
                'path' => $logoPath,
                'name' => basename($logoPath),
                'original_name' => $image->getClientOriginalName(),
                'size' => $image->getSize(),
                'extension' => $image->extension(),
                'is_main' => true,
                'typeable_type' => Brand::class,
                'typeable_id' => $brand->id,
            ]);
        } else {
            $brand = Brand::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
            ]);
        }


        return redirect()->route('admin.brands.index')->with('success', 'Marca criada com sucesso!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand)
    {
        return Inertia::render('Admin/Brands/Edit', [
            'brand' => $brand
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Brand $brand)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|file|mimes:jpg,jpeg,png,svg,webp|max:2048',
        ]);
        $data = [
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ];
        if ($request->hasFile('logo')) {
            $image = $request->file('logo');
            $data['logo'] = $image->store('brands', 'public');

            Image::create([
                'version' => 'original',
                'storage' => 'public',
                'path' => $data['logo'],
                'name' => basename($data['logo']),
                'original_name' => $image->getClientOriginalName(),
                'size' => $image->getSize(),
                'extension' => $image->extension(),
                'is_main' => true,
                'typeable_type' => Brand::class,
                'typeable_id' => $brand->id,
            ]);
        }
        $brand->update($data);
        return redirect()->route('admin.brands.index')->with('success', 'Marca atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand)
    {
        $brand->delete();
        return redirect()->route('admin.brands.index')->with('success', 'Marca excluída com sucesso!');
    }
}
