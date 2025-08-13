<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SettingsController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:settings.index', only: ['index']),
            new Middleware('permission:settings.create', only: ['store']),
            new Middleware('permission:settings.edit', only: ['update']),
            new Middleware('permission:settings.destroy', only: ['destroy']),
            new Middleware('permission:settings.viewgroup', only: ['getByGroup']),
        ];
    }
    /**
     * Display the settings management page.
     */
    public function index(Request $request)
    {
        $query = Setting::query();

        // Filter by group if provided
        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        // Search in key, value, or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $settings = $query->orderBy('group')->orderBy('key')->get()->groupBy('group');

        // Get all unique groups for filter dropdown
        $groups = Setting::distinct()->pluck('group')->sort()->values();

        return Inertia::render('settings/system', [
            'settings' => $settings,
            'groups' => $groups,
            'filters' => [
                'search' => $request->search,
                'group' => $request->group,
            ],
        ]);
    }

    /**
     * Store a newly created setting.
     */
    public function store(Request $request)
    {
        $request->validate([
            'group' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'value' => 'nullable|string',
            'description' => 'nullable|string',
            'type' => 'required|string|in:text,number,boolean,email,url,textarea',
            'is_public' => 'boolean',
        ]);

        // Verificar se já existe uma setting com a mesma combinação grupo/chave
        $existingSetting = Setting::where('group', $request->group)
                                  ->where('key', $request->key)
                                  ->first();

        if ($existingSetting) {
            return redirect()->back()->with('error', 'A setting with this group and key already exists.');
        }

        try {
            $setting = Setting::create($request->all());

            return redirect()->back()->with('success', 'Setting created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error creating setting: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified setting.
     */
    public function update(Request $request, Setting $setting)
    {
        $request->validate([
            'group' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'value' => 'nullable|string',
            'description' => 'nullable|string',
            'type' => 'required|string|in:text,number,boolean,email,url,textarea',
            'is_public' => 'boolean',
        ]);

        try {
            $setting->update($request->all());

            return redirect()->back()->with('success', 'Setting updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error updating setting: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified setting.
     */
    public function destroy(Setting $setting)
    {
        try {
            $setting->delete();

            return redirect()->back()->with('success', 'Setting deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error deleting setting: ' . $e->getMessage());
        }
    }

    /**
     * Get settings by group for API access.
     */
    public function getByGroup(string $group)
    {
        $settings = Setting::where('group', $group)->get();

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }
}
