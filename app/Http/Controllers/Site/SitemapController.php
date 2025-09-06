<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Product;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    public function index()
    {
        $sitemap = Sitemap::create();

        $sitemap->add(Url::create(route('home'))->setPriority(1.0)->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));
        $sitemap->add(Url::create(route('about'))->setPriority(0.8)->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY));
        $sitemap->add(Url::create(route('contact'))->setPriority(0.8)->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY));
        $sitemap->add(Url::create(route('products.index'))->setPriority(0.9)->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY));
        $sitemap->add(Url::create(route('blog.index'))->setPriority(0.9)->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY));
        // $sitemap->add(Url::create(route('catalogs.index'))->setPriority(0.7)->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY));
        $sitemap->add(Url::create(route('terms'))->setPriority(0.3)->setChangeFrequency(Url::CHANGE_FREQUENCY_YEARLY));
        $sitemap->add(Url::create(route('privacy'))->setPriority(0.3)->setChangeFrequency(Url::CHANGE_FREQUENCY_YEARLY));

        Product::whereHas('ecommerce_inventory')->get()->each(function (Product $product) use ($sitemap) {
            $sitemap->add(Url::create(route('products.show', $product))->setLastModificationDate($product->updated_at));
        });

        $sitemap->add(Url::create(route('products.index', ['search' => 'd']))->setPriority(0.9)->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));

        Blog::published()->get()->each(function (Blog $post) use ($sitemap) {
            $sitemap->add(Url::create(route('blog.show', $post))->setLastModificationDate($post->updated_at));
        });

        $sitemap->add(Url::create(route('blog.index', ['search' => 'd']))->setPriority(0.9)->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));
        return $sitemap;
    }
}
