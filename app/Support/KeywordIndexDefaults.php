<?php

namespace App\Support;

class KeywordIndexDefaults
{
    /**
     * @return array<int, array{label:string, keyword_type:string, sector:?string, source:string}>
     */
    public static function records(): array
    {
        return array_merge(self::brandRecords(), self::productRecords());
    }

    /**
     * @return array<int, array{label:string, keyword_type:string, sector:?string, source:string}>
     */
    private static function brandRecords(): array
    {
        $sectors = [
            'Beauty' => ['Sephora', 'Ulta Beauty', 'e.l.f. Cosmetics', 'Rare Beauty', 'Fenty Beauty', 'Glossier', 'Tarte', 'Maybelline', 'Neutrogena', 'CeraVe', 'Cetaphil', 'Olay', 'Dove', 'Native', 'Summer Fridays', 'Drunk Elephant', 'Rhode', 'Laneige', 'Kiehl\'s', 'Clinique', 'MAC Cosmetics', 'Charlotte Tilbury', 'ColourPop', 'Morphe', 'Kosas'],
            'Fashion' => ['Nike', 'Adidas', 'Lululemon', 'Levi\'s', 'Gap', 'Old Navy', 'American Eagle', 'Aerie', 'Coach', 'Michael Kors', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren', 'Skims', 'Victoria\'s Secret', 'Under Armour', 'Vans', 'Converse', 'Crocs', 'New Balance', 'Steve Madden', 'Madewell', 'J.Crew', 'Free People', 'Tory Burch'],
            'Retail' => ['Target', 'Walmart', 'Costco', 'Sam\'s Club', 'Kroger', 'Trader Joe\'s', 'Whole Foods', 'CVS', 'Walgreens', 'Best Buy', 'Home Depot', 'Lowe\'s', 'Macy\'s', 'Nordstrom', 'TJ Maxx', 'Marshalls', 'Ross', 'Dollar General', 'Dollar Tree', 'Five Below', 'Petco', 'PetSmart', 'Staples', 'Office Depot', 'Michaels'],
            'Food & Beverage' => ['Starbucks', 'Dunkin', 'McDonald\'s', 'Chick-fil-A', 'Chipotle', 'Panera Bread', 'Domino\'s', 'Pizza Hut', 'Taco Bell', 'KFC', 'Subway', 'Shake Shack', 'Sweetgreen', 'Cava', 'Coca-Cola', 'Pepsi', 'Dr Pepper', 'Sprite', 'Gatorade', 'Celsius', 'Olipop', 'Poppi', 'LaCroix', 'Blue Bottle Coffee', 'Dutch Bros'],
            'Tech' => ['Apple', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Disney+', 'Samsung', 'Dell', 'HP', 'Lenovo', 'Sony', 'Nintendo', 'Xbox', 'PlayStation', 'GoPro', 'Ring', 'Fitbit', 'Garmin', 'Anker', 'Bose', 'Beats', 'Logitech', 'Roku', 'Tile'],
            'Home' => ['IKEA', 'Wayfair', 'West Elm', 'Pottery Barn', 'Crate & Barrel', 'Williams Sonoma', 'Dyson', 'Shark', 'KitchenAid', 'Instant Pot', 'Ninja', 'Keurig', 'Yeti', 'Stanley', 'Hydro Flask', 'Caraway', 'Our Place', 'HexClad', 'Purple', 'Casper', 'Brooklinen', 'Parachute', 'Bearaby', 'Serta', 'Tempur-Pedic'],
            'Health & Wellness' => ['Peloton', 'Equinox', 'Planet Fitness', 'Orangetheory', 'Noom', 'Hims', 'Hers', 'Roman', 'Athletic Greens', 'Bloom Nutrition', 'Vital Proteins', 'Orgain', 'Optimum Nutrition', 'Therabody', 'Hyperice', 'Eight Sleep', 'Oura', 'Whoop', 'Calm', 'Headspace', 'Olly', 'Nature Made', 'Centrum', 'Liquid I.V.', 'LMNT'],
            'Auto & Travel' => ['Tesla', 'Ford', 'Chevrolet', 'Toyota', 'Honda', 'Jeep', 'Subaru', 'Hyundai', 'Kia', 'Turo', 'Uber', 'Lyft', 'Southwest', 'Delta', 'United', 'JetBlue', 'Marriott', 'Hilton', 'Airbnb', 'Vrbo', 'Expedia', 'Booking.com', 'Hertz', 'Enterprise', 'Avis'],
            'Finance' => ['Chase', 'Bank of America', 'Wells Fargo', 'Capital One', 'American Express', 'Discover', 'PayPal', 'Venmo', 'Cash App', 'Robinhood', 'Coinbase', 'SoFi', 'Credit Karma', 'Intuit', 'TurboTax', 'H&R Block', 'Affirm', 'Klarna', 'Afterpay', 'Stripe', 'Square', 'Zelle', 'Rocket Money', 'Acorns', 'Betterment'],
            'Entertainment & Media' => ['Spotify', 'YouTube', 'Hulu', 'Max', 'Paramount+', 'Peacock', 'Twitch', 'TikTok Shop', 'Audible', 'Kindle', 'SiriusXM', 'The New York Times', 'The Wall Street Journal', 'ESPN', 'Bleacher Report', 'Barstool Sports', 'Fandango', 'AMC Theatres', 'Regal', 'Discord', 'Reddit', 'Pinterest', 'Canva', 'Figma', 'Notion'],
        ];

        $records = [];

        foreach ($sectors as $sector => $brands) {
            foreach ($brands as $brand) {
                $records[] = [
                    'label' => $brand,
                    'keyword_type' => 'brand',
                    'sector' => $sector,
                    'source' => 'seed',
                ];
            }
        }

        foreach (self::landingBrandRecords() as $record) {
            $records[] = $record;
        }

        return $records;
    }

    /**
     * Mirror the landing-page brand marquee so search suggestions reflect the
     * same brands we already showcase publicly.
     *
     * @return array<int, array{label:string, keyword_type:string, sector:?string, source:string}>
     */
    private static function landingBrandRecords(): array
    {
        return [
            ['label' => 'Glossier', 'keyword_type' => 'brand', 'sector' => 'Beauty', 'source' => 'landing'],
            ['label' => 'GoPure', 'keyword_type' => 'brand', 'sector' => 'Skincare', 'source' => 'landing'],
            ['label' => 'Ridge', 'keyword_type' => 'brand', 'sector' => 'Accessories', 'source' => 'landing'],
            ['label' => 'Olipop', 'keyword_type' => 'brand', 'sector' => 'Beverage', 'source' => 'landing'],
            ['label' => 'Caraway', 'keyword_type' => 'brand', 'sector' => 'Home', 'source' => 'landing'],
            ['label' => 'Loops', 'keyword_type' => 'brand', 'sector' => 'Skincare', 'source' => 'landing'],
            ['label' => 'Hexclad', 'keyword_type' => 'brand', 'sector' => 'Kitchen', 'source' => 'landing'],
            ['label' => 'Vessi', 'keyword_type' => 'brand', 'sector' => 'Footwear', 'source' => 'landing'],
            ['label' => 'Bala', 'keyword_type' => 'brand', 'sector' => 'Fitness', 'source' => 'landing'],
            ['label' => 'Mud\\Wtr', 'keyword_type' => 'brand', 'sector' => 'Beverage', 'source' => 'landing'],
            ['label' => 'Solawave', 'keyword_type' => 'brand', 'sector' => 'Beauty Tech', 'source' => 'landing'],
            ['label' => 'Jones Road', 'keyword_type' => 'brand', 'sector' => 'Beauty', 'source' => 'landing'],
        ];
    }

    /**
     * @return array<int, array{label:string, keyword_type:string, sector:?string, source:string}>
     */
    private static function productRecords(): array
    {
        $basesBySector = [
            'Beauty' => ['lip oil', 'lip gloss', 'lip stain', 'mascara', 'skin tint', 'blush stick', 'bronzing drops', 'face sunscreen', 'cleanser', 'retinol serum', 'vitamin c serum', 'peptide moisturizer', 'pimple patch', 'lash serum', 'brow gel', 'setting spray', 'concealer', 'hair oil', 'heatless curls', 'dry shampoo'],
            'Fashion' => ['running shoes', 'white sneakers', 'crossbody bag', 'work tote', 'shapewear', 'seamless leggings', 'cargo pants', 'graphic tee', 'hoodie', 'wide leg jeans', 'dress pants', 'sunglasses', 'ankle boots', 'platform sandals', 'crew socks', 'baseball cap', 'puffer jacket', 'trench coat', 'matching set', 'lounge set'],
            'Home' => ['water bottle', 'tumbler', 'air fryer', 'espresso machine', 'vacuum', 'robot vacuum', 'mattress topper', 'weighted blanket', 'sheet set', 'nonstick pan', 'knife set', 'desk chair', 'standing desk', 'diffuser', 'storage bins', 'meal prep containers', 'cutting board', 'coffee grinder', 'portable blender', 'smart lamp'],
            'Tech' => ['wireless earbuds', 'bluetooth speaker', 'phone tripod', 'ring light', 'portable charger', 'laptop stand', 'mechanical keyboard', 'gaming mouse', 'webcam', 'phone case', 'screen protector', 'tablet stand', 'smartwatch', 'fitness tracker', 'dash cam', 'action camera', 'usb hub', 'monitor light', 'mag safe charger', 'noise cancelling headphones'],
            'Wellness' => ['protein powder', 'greens powder', 'electrolyte mix', 'pre workout', 'creatine gummies', 'collagen peptides', 'sleep gummies', 'magnesium spray', 'walking pad', 'foam roller', 'massage gun', 'yoga mat', 'pilates socks', 'ankle weights', 'sauna blanket', 'ice roller', 'red light mask', 'posture corrector', 'hydration packets', 'meal replacement shake'],
            'Food & Beverage' => ['iced coffee', 'energy drink', 'sparkling water', 'protein bar', 'granola', 'matcha powder', 'mushroom coffee', 'soda alternative', 'hot sauce', 'snack box', 'meal kit', 'cookie dough', 'frozen pizza', 'cold brew', 'oat milk', 'almond milk', 'coconut water', 'zero sugar soda', 'fruit snacks', 'high protein yogurt'],
        ];

        $modifiers = [
            'review', 'tiktok made me buy it', 'best', 'amazon', 'unboxing', 'for beginners', 'before and after', 'worth it',
        ];

        $records = [];

        foreach ($basesBySector as $sector => $bases) {
            foreach ($bases as $base) {
                $records[] = [
                    'label' => $base,
                    'keyword_type' => 'product',
                    'sector' => $sector,
                    'source' => 'seed',
                ];

                foreach ($modifiers as $modifier) {
                    $records[] = [
                        'label' => $modifier === 'best' ? "best {$base}" : "{$base} {$modifier}",
                        'keyword_type' => 'product',
                        'sector' => $sector,
                        'source' => 'seed',
                    ];
                }
            }
        }

        return $records;
    }
}
