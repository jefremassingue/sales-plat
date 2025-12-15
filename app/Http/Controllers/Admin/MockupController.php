<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Prism\Prism\Prism;
use Prism\Prism\Enums\Provider;
use Prism\Prism\ValueObjects\Media\Image;

class MockupController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'jobType' => 'required|string',
            'printType' => 'required|string',
            'assets' => 'required|array|min:1',
            'assets.*.description' => 'required|string',
            'assets.*.sourceType' => 'required|in:library,upload',
            'assets.*.file' => 'nullable|image',
        ]);

        $designBrief = "Job Type: " . $request->input('jobType') . "\n";
        $designBrief .= "Print Type: " . $request->input('printType') . "\n";

        $inputImages = [];
        foreach ($request->input('assets') as $index => $asset) {
            $designBrief .= "Asset " . ($index + 1) . " Description: " . $asset['description'] . "\n";
            if ($asset['sourceType'] === 'upload' && $request->hasFile("assets.{$index}.file")) {
                $file = $request->file("assets.{$index}.file");
                $inputImages[] = Image::fromLocalPath($file->getRealPath());
            }
        }

        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $timeout = max((int) config('services.gemini.timeout', 60), 5);
        $connectTimeout = (int) config('services.gemini.connect_timeout', 15);
        if ($connectTimeout <= 0 || $connectTimeout > $timeout) {
            $connectTimeout = min($timeout, 20);
        }

        $response = Prism::image()
            ->withClientOptions([
                'timeout' => $timeout,
                'connect_timeout' => $connectTimeout,
            ])
            ->using(Provider::Gemini, $model)
            ->withPrompt($designBrief, $inputImages)
            ->generate();

        $uuid = Str::uuid()->toString();
        $imageData = base64_decode($response->firstImage()->base64);
        $path = "mockups/{$uuid}.png";
        Storage::disk('public')->put($path, $imageData);

        $payload = [
            'success' => true,
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ];

        if ($request->hasHeader('X-Inertia')) {
            return redirect()
                ->route('admin.mockups.index')
                ->with('mockup', $payload);
        }

        return response()->json($payload);
    }
}
