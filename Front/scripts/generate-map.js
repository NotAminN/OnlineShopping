import fs from 'fs';

const U = (id, w = 1200) => `https://images.unsplash.com/${id}?q=85&w=${w}&auto=format&fit=crop`;

export const PRODUCT_MAP = {
  /* ============================================================
     1. WOMEN (زنانه - 15 products)
     ============================================================ */
  'oversize-linen-coat': [
    U('photo-1539533018447-63fcce2678e3'), // Linen coat model
    U('photo-1515886657613-9f3515b0c78f')  // Linen coat styling
  ],
  'minimal-satin-dress': [
    U('photo-1496747611176-843222e1e57c'), // Minimal satin dress
    U('photo-1515372039744-b8f02a3ae446')  // Satin dress motion
  ],
  'silk-crepe-blouse': [
    U('photo-1499939667766-4afceb292d05'), // Elegant silk blouse
    U('photo-1564257631407-4deb1f99d992')  // Silk texture detail
  ],
  'long-crepe-manteau': [
    U('photo-1544022613-e87ca75a784a'), // Long chic manteau
    U('photo-1539109136881-3be0616acf4b')  // Manteau editorial
  ],
  'pleated-midi-skirt': [
    U('photo-1560243563-062bfc001d68'), // Pleated midi skirt
    U('photo-1529139574466-a303027c1d8b')  // Pleated movement
  ],
  'oversize-denim-jacket-w': [
    U('photo-1542272604-787c3835535d'), // Oversized denim jacket
    U('photo-1520975954732-35dd22299614')  // Denim street shot
  ],
  'warm-knit-coat': [
    U('photo-1434389677669-e08b4cac3105'), // Warm knit coat
    U('photo-1583743814966-8936f5b7be1a')  // Knit texture
  ],
  'simple-cotton-top': [
    U('photo-1620799140408-edc6dcb6d633'), // Minimal white cotton top
    U('photo-1503342217505-b0a15ec3261c')  // Cotton top lifestyle
  ],
  'straight-fabric-pants-w': [
    U('photo-1594633312681-425c7b97ccd1'), // Tailored fabric pants
    U('photo-1508427953056-b00b8d78ebf5')  // Pants styling
  ],
  'crewneck-sweater-w': [
    U('photo-1576871337622-98d48d1cf531'), // Soft knit sweater
    U('photo-1516762689617-e1cffcef479d')  // Crewneck cozy look
  ],
  'shimmer-party-dress': [
    U('photo-1566174053879-31528523f8ae'), // Shimmer evening gown
    U('photo-1595777457583-95e059d581b8')  // Party dress detail
  ],
  'crop-knit-cardigan': [
    U('photo-1608256246200-53e635b5b65f'), // Cropped knit cardigan
    U('photo-1618354691373-d851c5c3a990')  // Cardigan soft mood
  ],
  'wrap-midi-dress': [
    U('photo-1566150905458-1bf1fc113f0d'), // Elegant wrap dress
    U('photo-1572804013309-59a88b7e92f1')  // Wrap dress side view
  ],
  'wide-leg-pants-w': [
    U('photo-1509631179647-0177331693ae'), // Wide leg trousers
    U('photo-1551854838-212c50b4c184')  // Wide leg motion
  ],
  'satin-slip-skirt': [
    U('photo-1583496661160-fb5886a0aaaa'), // Satin slip skirt
    U('photo-1577900232427-18219b9166a0')  // Satin skirt flow
  ],

  /* ============================================================
     2. MEN (مردانه - 13 products)
     ============================================================ */
  'classic-single-breasted-suit': [
    U('photo-1507679799987-c73779587ccf'), // Tailored men suit
    U('photo-1594938298603-c8148c4dae35')  // Suit lapel detail
  ],
  'linen-shirt-men': [
    U('photo-1602810318383-e386cc2a3ccf'), // Men linen shirt
    U('photo-1490114538077-0a7f8cb49891')  // Linen relaxed view
  ],
  'cotton-tee-men': [
    U('photo-1521572163474-6864f9cf17ab'), // Clean white crew tee
    U('photo-1503341504253-dff4815485f1')  // Tee casual portrait
  ],
  'bomber-jacket': [
    U('photo-1485968579580-b6d095142e6e'), // Modern bomber jacket
    U('photo-1551028719-00167b16eac5')  // Bomber street style
  ],
  'straight-jeans-men': [
    U('photo-1541099649105-f69ad21f3246'), // Classic straight denim
    U('photo-1475178626620-a4d074967452')  // Denim texture
  ],
  'oversize-hoodie': [
    U('photo-1556821840-3a63f95609a7'), // Minimal oversized hoodie
    U('photo-1509967419530-da38b4704bc6')  // Hoodie street shot
  ],
  'pique-polo': [
    U('photo-1562157873-818bc0726f68'), // Premium pique polo
    U('photo-1586363104862-3a5e2ab60d99')  // Polo collar detail
  ],
  'leather-jacket-men': [
    U('photo-1521223890158-f9f7c3d5d504'), // Sleek leather biker jacket
    U('photo-1559551409-dadc959f76b8')  // Leather jacket detail
  ],
  'straight-linen-pants-men': [
    U('photo-1520975916090-3105956dac38'), // Linen trousers men
    U('photo-1507003211169-0a1dd7228f2d')  // Linen casual cut
  ],
  'knit-mock-neck-men': [
    U('photo-1617137968427-85924c800a22'), // Refined mock neck knit
    U('photo-1516257984-b1b4d707412e')  // Knit men portrait
  ],
  'oxford-shirt-men': [
    U('photo-1596755094514-f87e34085b2c'), // Crisp oxford button-down
    U('photo-1588359348347-9bc6cbbb689e')  // Oxford shirt detail
  ],
  'cargo-pants-men': [
    U('photo-1524498250077-390f9e378fc0'), // Utility cargo pants
    U('photo-1624378439575-d8705ad7ae80')  // Cargo pocket styling
  ],
  'quilted-vest-men': [
    U('photo-1592878904946-b3cd8ae243d0'), // Quilted lightweight vest
    U('photo-1618354691438-25bc04584c23')  // Layered vest look
  ],

  /* ============================================================
     3. SHOES (کفش - 9 products)
     ============================================================ */
  'leather-loafers': [
    U('photo-1533867617858-e7b97e060509'), // Artisan leather loafers
    U('photo-1614252235316-8c857d38b5f4')  // Loafers close-up
  ],
  'minimal-white-sneakers': [
    U('photo-1549298916-b41d501d3772'), // Minimal clean white sneakers
    U('photo-1560769629-975ec94e6a86')  // Sneakers sole detail
  ],
  'leather-summer-sandals': [
    U('photo-1603487742131-4160ec999306'), // Strappy leather sandals
    U('photo-1543163521-1bf539c55dd2')  // Summer sandals lifestyle
  ],
  'winter-leather-boots': [
    U('photo-1449505278894-297fdb3edbc1'), // Classic leather boots
    U('photo-1542838132-92c53300491e')  // Boots rugged detail
  ],
  'running-sneakers': [
    U('photo-1595950653106-6c9ebd614d3a'), // Modern performance runners
    U('photo-1606107557195-0e29a4b5b4aa')  // Running shoe angle
  ],
  'leather-college-shoes': [
    U('photo-1614252369475-531eba835eb1'), // Classic college derby/oxford
    U('photo-1460353581641-37baddab0fa2')  // Polished shoes detail
  ],
  'chunky-sole-sneakers': [
    U('photo-1552346154-21d32810aba3'), // Chunky sole streetwear sneakers
    U('photo-1584735935682-2f2b69dff9d2')  // Chunky sole angle
  ],
  'suede-derby-shoes': [
    U('photo-1560343090-f0409e92791a'), // Premium suede derby
    U('photo-1582588678413-dbf45f4823e9')  // Suede leather texture
  ],
  'slide-sandals': [
    U('photo-1600185365483-26d7a4cc7519'), // Comfort slide sandals
    U('photo-1603808033192-082d6919d3e1')  // Slides lifestyle
  ],

  /* ============================================================
     4. BAGS (کیف - 8 products)
     ============================================================ */
  'leather-handbag': [
    U('photo-1584917865442-de89df76afd3'), // Elegant leather handbag
    U('photo-1590874103328-eac38a683ce7')  // Handbag side profile
  ],
  'mini-shoulder-bag': [
    U('photo-1591561954557-26941169b49e'), // Structured mini shoulder bag
    U('photo-1559563458-527698bf5295')  // Mini bag on shoulder
  ],
  'urban-backpack': [
    U('photo-1553062407-98eeb64c6a62'), // Sleek urban travel backpack
    U('photo-1622560480605-d83c853bc5c3')  // Backpack straps detail
  ],
  'office-laptop-bag': [
    U('photo-1548036328-c9fa89d128fa'), // Leather executive briefcase
    U('photo-1547949003-9792a18a2601')  // Laptop bag interior
  ],
  'party-clutch': [
    U('photo-1548863227-3af567fc3b27'), // Satin evening clutch
    U('photo-1594223274512-ad4803739b7c')  // Clutch clasp detail
  ],
  'tote-bag-canvas': [
    U('photo-1597484661643-2f5fef640dd1'), // Sturdy canvas & leather tote
    U('photo-1544816155-12df9643f363')  // Canvas tote in hand
  ],
  'crossbody-mini-bag': [
    U('photo-1575032617751-6ddec2089882'), // Contemporary crossbody bag
    U('photo-1548036328-c9fa89d128fa')  // Crossbody pouch detail
  ],
  'leather-wallet-unisex': [
    U('photo-1627123424574-724758594e93'), // Handcrafted leather wallet
    U('photo-1553062407-98eeb64c6a62')  // Open wallet card slots
  ],

  /* ============================================================
     5. ACCESSORIES (اکسسوری - 9 products)
     ============================================================ */
  'aviator-sunglasses': [
    U('photo-1572635196237-14b3f281503f'), // Classic gold-frame aviator
    U('photo-1511499767150-a48a237f0083')  // Aviator sunglasses on face
  ],
  'minimal-steel-watch': [
    U('photo-1523170335258-f5ed11844a49'), // Minimalist stainless steel watch
    U('photo-1547996160-81dfa63595aa')  // Watch dial detail
  ],
  'classic-leather-belt': [
    U('photo-1624222247344-550fb60583dc'), // Polished leather belt
    U('photo-1611652022419-a9419f74343d')  // Belt buckle close-up
  ],
  'patterned-cotton-scarf': [
    U('photo-1601924994987-69e26d50dc26'), // Fine printed silk/cotton scarf
    U('photo-1511556532299-8f662fc26c06')  // Draped scarf styling
  ],
  'minimal-steel-necklace': [
    U('photo-1599643478518-a784e5dc4c8f'), // Minimal delicate chain necklace
    U('photo-1535632066927-ab7c9ab60908')  // Necklace worn collarbone
  ],
  'cat-eye-sunglasses': [
    U('photo-1508296695146-257a814070b4'), // Bold cat-eye sunglasses
    U('photo-1577803645773-f96470509666')  // Cat-eye sunglasses angle
  ],
  'wool-fedora-hat': [
    U('photo-1514327605112-b887c0e61c0a'), // Structured wool fedora hat
    U('photo-1533055640609-24b498dfd74c')  // Fedora brim detail
  ],
  'leather-card-holder': [
    U('photo-1606503153255-59d8b8b82176'), // Slim leather card wallet
    U('photo-1607604276583-eef5d076aa5f')  // Cardholder in hand
  ],
  'chain-bracelet': [
    U('photo-1611591437281-460bfbe1220a'), // Chunky link steel chain bracelet
    U('photo-1573408301185-9146fe634ad0')  // Bracelet on wrist
  ],

  /* ============================================================
     6. KIDS (بچگانه - 8 products)
     ============================================================ */
  'kids-striped-set': [
    U('photo-1519238263530-99bdd11df2ea'), // Striped kids summer set
    U('photo-1503919545889-aef636e10ad4')  // Kids play set
  ],
  'kids-knit-jacket': [
    U('photo-1471286174890-9c112ffca5b4'), // Cozy knit baby/kids cardigan
    U('photo-1499714608240-22fc6ad53fb2')  // Kids warm layer
  ],
  'kids-cotton-dress': [
    U('photo-1622290291468-a28f7a7dc6a8'), // Floral soft cotton kids dress
    U('photo-1518831959646-742c3a14ebf7')  // Kids dress outdoor
  ],
  'kids-comfort-shorts': [
    U('photo-1508214751196-bcfd4ca60f91'), // Comfy drawstring cotton shorts
    U('photo-1519415943484-9fa1873496d4')  // Kids active play shorts
  ],
  'kids-sneakers': [
    U('photo-1514989940723-e8e51635b782'), // Kids flexible sneakers
    U('photo-1562183241-b937e95585b6')  // Kids footwear detail
  ],
  'kids-hoodie-set': [
    U('photo-1519457431-44ccd64a579b'), // Soft kids hoodie & sweatpants
    U('photo-1476820865390-c52aeebb9891')  // Kids hoodie portrait
  ],
  'kids-denim-overall': [
    U('photo-1522771739844-6a9f6d5f14af'), // Classic denim dungarees / overall
    U('photo-1516627145497-ae6968895b74')  // Overall side angle
  ],
  'kids-summer-hat': [
    U('photo-1502086223501-7ea6ecd79368'), // Woven straw/cotton sun hat
    U('photo-1485546246426-74dc88dec4d9')  // Sun hat child
  ]
};

if (process.argv[1].endsWith('generate-map.js')) {
  fs.writeFileSync('scripts/product-images.map.json', JSON.stringify(PRODUCT_MAP, null, 2));
  console.log('Successfully wrote scripts/product-images.map.json with', Object.keys(PRODUCT_MAP).length, 'products');

  let code = fs.readFileSync('src/js/data/products.js', 'utf8');
  const newMake = `const make = ({
  slug,
  name,
  category,
  brand,
  price,
  originalPrice = null,
  images,
  colors,
  sizes,
  material,
  description,
  rating = 4.4,
  reviews = 12,
  sold = 40,
  stock = 10,
  tags = [],
  featured = false,
  newArrival = false,
}) => {
  const resolved = images || [\`/images/products/\${slug}.jpg\`, \`/images/products/\${slug}-2.jpg\`];
  return {
    id: \`p-\${String(++seq).padStart(3, '0')}\`,
    slug,
    name,
    category,
    brand,
    price,
    originalPrice,
    discount:
      originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0,
    images: resolved,
    colors,
    sizes,
    material,
    description,
    rating,
    reviews,
    sold,
    stock,
    tags,
    featured,
    newArrival,
  };
};`;

  code = code.replace(/const make = \({[\s\S]*?\n\};\n/m, newMake + '\n');

  const entries = Object.entries(PRODUCT_MAP).map(([k, [u1, u2]]) => {
    const id1 = u1.match(/photo-([^?]+)/)[1];
    const id2 = u2.match(/photo-([^?]+)/)[1];
    const pad = ' '.repeat(Math.max(1, 35 - k.length));
    return `  '${k}':${pad}['${id1}', '${id2}'],`;
  }).join('\n');

  const newImg = `export const IMG = Object.freeze({\n${entries}\n});`;
  code = code.replace(/(?:export\s+)?const IMG = Object\.freeze\({[\s\S]*?\n\}\);/m, newImg);

  fs.writeFileSync('src/js/data/products.js', code, 'utf8');
  console.log('Successfully updated src/js/data/products.js');
}
