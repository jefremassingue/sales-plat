<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Image;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BlogController extends Controller
{
    public function index()
    {
        return Blog::all();
    }

    public function storeWithFile(Request $request)
    {
        return $this->saveBlog($request, null, 'file');
    }

    public function storeWithUrl(Request $request)
    {
        return $this->saveBlog($request, null, 'url');
    }

    public function show(string $id)
    {
        return Blog::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $blog = Blog::findOrFail($id);
        // For updates, we need to determine the image input type from the request.
        $imageInputType = $request->hasFile('featured_image') ? 'file' : 'url';
        return $this->saveBlog($request, $blog, $imageInputType);
    }

    public function destroy(string $id)
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();

        return response()->json(null, 204);
    }

    private function saveBlog(Request $request, Blog $blog = null, string $imageInputType = 'url')
    {
        $validationRules = $this->getValidationRules($blog, $imageInputType);
        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $data = $validator->validated();

            if (isset($data['title'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            // Remove featured_image from data to avoid saving it directly to the database
            unset($data['featured_image']);

            if ($blog) {
                $blog->update($data);
            } else {
                $data['user_id'] = User::first()->id;
                $blog = Blog::create($data);
            }

            $this->processFeaturedImage($request, $blog, $imageInputType);

            DB::commit();

            return response()->json($blog, $blog->wasRecentlyCreated ? 201 : 200);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error saving blog post: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'An unexpected error occurred: ' . $e->getMessage()], 500);
        }
    }

    private function getValidationRules(Blog $blog = null, string $imageInputType = 'url'): array
    {
        $rules = [
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'status' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            // 'user_id' => 'sometimes|exists:users,id',
            'blog_category_id' => 'nullable|exists:blog_categories,id',
        ];

        if ($imageInputType === 'file') {
            $rules['featured_image'] = 'nullable|file|mimes:jpg,jpeg,png,gif|max:10240';
        } else {
            $rules['featured_image'] = 'nullable|url';
        }

        if ($blog) {
            // Update: title is not always required
            $rules['title'] = 'sometimes|string|max:255';
        } else {
            // Create: title is required
            $rules['title'] = 'required|string|max:255';
            // $rules['user_id'] = 'required|exists:users,id';
            $rules['content'] = 'required|string';
        }

        return $rules;
    }

    private function processFeaturedImage(Request $request, Blog $blog, string $imageInputType)
    {
        if (!$request->has('featured_image')) {
            return;
        }

        // If there's an existing image, delete it before processing the new one.
        if ($blog->image) {
            Storage::disk('public')->delete($blog->image->path);
            $blog->image->delete();
        }

        $path = null;
        $imageName = null;
        $imageContent = null;

        if ($imageInputType === 'file' && $request->hasFile('featured_image')) {
            $imageFile = $request->file('featured_image');
            $path = $imageFile->store('blogs', 'public');
            $imageName = $imageFile->getClientOriginalName();
            $imageContent = file_get_contents(storage_path('app/public/' . $path));
        } elseif ($imageInputType === 'url' && $request->filled('featured_image')) {
            $client = new Client();
            try {
                $imageUrl = $request->input('featured_image');
                $imageContent = $client->get($imageUrl)->getBody()->getContents();
                $imageName = basename(parse_url($imageUrl, PHP_URL_PATH));
                $path = 'blogs/' . $blog->id . '-' . Str::random(8) . '-' . $imageName;
                Storage::disk('public')->put($path, $imageContent);
            } catch (\Exception $e) {
                Log::error("Failed to download image from URL: {$request->input('featured_image')}", ['error' => $e->getMessage()]);
                return; // Stop processing if download fails
            }
        }

        if ($path) {
            $this->createImageRecord($blog, $path, $imageName, strlen($imageContent), pathinfo($path, PATHINFO_EXTENSION));
            $blog->featured_image = $path;
            $blog->save();
        }
    }

    private function createImageRecord(Blog $blog, $path, $originalName, $size, $extension): Image
    {
        $image = new Image([
            'version' => 'original',
            'storage' => 'public',
            'path' => $path,
            'name' => basename($path),
            'original_name' => $originalName,
            'size' => $size,
            'extension' => $extension,
            'is_main' => true
        ]);
        $blog->image()->save($image);
        return $image;
    }
}
