<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HeroSliderController extends Controller
{
    public function index()
    {
        $slides = HeroSlider::orderBy('order')->get();
        return Inertia::render('Admin/HeroSliders/Index', ['slides' => $slides]);
    }

    public function create()
    {
        return Inertia::render('Admin/HeroSliders/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supertitle' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'cta_text' => 'nullable|string|max:255',
            'cta_link' => 'nullable|string|max:255',
            'text_position' => 'required|in:left,right,center',
            'text_color' => 'required|string|max:255',
            'overlay_color' => 'required|string|max:255',
            'active' => 'required|boolean',
            'order' => 'required|integer',
            'image' => 'required|image',
        ]);

        $slide = HeroSlider::create($data);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('hero-sliders', 'public');
            $slide->image()->create([
                'storage' => 'public',
                'path' => $path,
                'name' => basename($path),
                'original_name' => $request->file('image')->getClientOriginalName(),
                'size' => $request->file('image')->getSize(),
                'extension' => $request->file('image')->getClientOriginalExtension(),
                'version' => 'original',
                'is_main' => true,
            ]);
        }

        return redirect()->route('admin.hero-sliders.index')->with('success', 'Slide criado com sucesso.');
    }

    public function edit(HeroSlider $heroSlider)
    {
        return Inertia::render('Admin/HeroSliders/Edit', ['slide' => $heroSlider->load('image')]);
    }

    public function update(Request $request, HeroSlider $heroSlider)
    {
        $data = $request->validate([
            'supertitle' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'cta_text' => 'nullable|string|max:255',
            'cta_link' => 'nullable|string|max:255',
            'text_position' => 'required|in:left,right,center',
            'text_color' => 'required|string|max:255',
            'overlay_color' => 'required|string|max:255',
            'active' => 'required|boolean',
            'order' => 'required|integer',
            'image' => 'nullable|image',
        ]);

        $heroSlider->update($data);

        if ($request->hasFile('image')) {
            if ($heroSlider->image) {
                Storage::disk('public')->delete($heroSlider->image->path);
                $heroSlider->image->delete();
            }
            $path = $request->file('image')->store('hero-sliders', 'public');
            $heroSlider->image()->create([
                'storage' => 'public',
                'path' => $path,
                'name' => basename($path),
                'original_name' => $request->file('image')->getClientOriginalName(),
                'size' => $request->file('image')->getSize(),
                'extension' => $request->file('image')->getClientOriginalExtension(),
                'version' => 'original',
                'is_main' => true,
            ]);
        }

        return redirect()->route('admin.hero-sliders.index')->with('success', 'Slide atualizado com sucesso.');
    }

    public function destroy(HeroSlider $heroSlider)
    {
        if ($heroSlider->image) {
            Storage::disk('public')->delete($heroSlider->image->path);
            $heroSlider->image->delete();
        }
        $heroSlider->delete();

        return redirect()->route('admin.hero-sliders.index')->with('success', 'Slide removido com sucesso.');
    }
}