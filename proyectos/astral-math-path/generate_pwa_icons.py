#!/usr/bin/env python3
"""
Genera todos los iconos PWA para Astral Math Path.
Usa el logo horizontal y la cover como base, con fondo del color del juego (#030712).
"""
from PIL import Image, ImageDraw
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
ICONS_DIR = os.path.join(ASSETS_DIR, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

BG_COLOR = (3, 7, 18, 255)       # --bg-deep #030712
CYAN_COLOR = (6, 182, 212, 255)  # --cyan-glow #06b6d4
PINK_COLOR = (236, 72, 153, 255) # --pink-glow #ec4899

logo_path = os.path.join(ASSETS_DIR, "logo.png")
cover_path = os.path.join(ASSETS_DIR, "cover.png")

logo = Image.open(logo_path).convert("RGBA")
cover = Image.open(cover_path).convert("RGBA")

# Tamaños PWA estándar
ICON_SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]

def make_square_icon(size):
    """Crea icono cuadrado: fondo oscuro + logo centrado con padding."""
    canvas = Image.new("RGBA", (size, size), BG_COLOR)
    
    # El logo es 1774x887 (2:1), lo ponemos en el 70% del ancho con padding
    pad = int(size * 0.12)
    target_w = size - (pad * 2)
    # Mantener aspect ratio del logo
    logo_w, logo_h = logo.size
    scale = target_w / logo_w
    new_h = int(logo_h * scale)
    
    # Si el alto resultante supera el espacio, escalar por alto
    max_h = size - (pad * 2)
    if new_h > max_h:
        scale = max_h / logo_h
        target_w = int(logo_w * scale)
        new_h = max_h

    resized_logo = logo.resize((target_w, new_h), Image.LANCZOS)
    
    # Centrar
    x = (size - target_w) // 2
    y = (size - new_h) // 2
    
    canvas.paste(resized_logo, (x, y), resized_logo)
    
    # Añadir borde sutil con gradiente cyan→pink (simular con línea superior)
    draw = ImageDraw.Draw(canvas)
    border = max(2, size // 64)
    draw.rectangle([0, 0, size-1, border-1], fill=CYAN_COLOR)
    draw.rectangle([0, size-border, size-1, size-1], fill=PINK_COLOR)
    
    return canvas.convert("RGB")

def make_maskable_icon(size):
    """Icono maskable: safe zone 80%, fondo más grande."""
    canvas = Image.new("RGBA", (size, size), BG_COLOR)
    
    # Safe zone = 80% del total
    safe = int(size * 0.80)
    pad = (size - safe) // 2
    
    logo_w, logo_h = logo.size
    # Logo ocupa 85% del safe zone
    target_w = int(safe * 0.85)
    scale = target_w / logo_w
    new_h = int(logo_h * scale)
    
    max_h = int(safe * 0.85)
    if new_h > max_h:
        scale = max_h / logo_h
        target_w = int(logo_w * scale)
        new_h = max_h
    
    resized_logo = logo.resize((target_w, new_h), Image.LANCZOS)
    x = (size - target_w) // 2
    y = (size - new_h) // 2
    
    canvas.paste(resized_logo, (x, y), resized_logo)
    return canvas.convert("RGB")

# Generar todos los iconos
for size in ICON_SIZES:
    icon = make_square_icon(size)
    out_path = os.path.join(ICONS_DIR, f"icon-{size}x{size}.png")
    icon.save(out_path, "PNG", optimize=True)
    print(f"  ✓ icon-{size}x{size}.png")

# Maskable para 192 y 512
for size in [192, 512]:
    icon = make_maskable_icon(size)
    out_path = os.path.join(ICONS_DIR, f"icon-{size}x{size}-maskable.png")
    icon.save(out_path, "PNG", optimize=True)
    print(f"  ✓ icon-{size}x{size}-maskable.png")

# Favicon 32x32 y 16x16
for size in [16, 32]:
    icon = make_square_icon(size)
    out_path = os.path.join(ICONS_DIR, f"favicon-{size}x{size}.png")
    icon.save(out_path, "PNG", optimize=True)
    print(f"  ✓ favicon-{size}x{size}.png")

# Apple Touch Icon 180x180
apple = make_square_icon(180)
apple.save(os.path.join(ICONS_DIR, "apple-touch-icon.png"), "PNG", optimize=True)
print("  ✓ apple-touch-icon.png (180x180)")

# Splash screen para PWA: usar la cover con overlay del logo (para iOS)
def make_splash(width, height, label=""):
    """Splash screen PWA para iOS."""
    canvas = Image.new("RGB", (width, height), (3, 7, 18))
    
    # Pegar la cover centrada y escalada para cubrir toda la pantalla
    cw, ch = cover.size
    scale_w = width / cw
    scale_h = height / ch
    scale = max(scale_w, scale_h)
    
    new_cw = int(cw * scale)
    new_ch = int(ch * scale)
    resized_cover = cover.resize((new_cw, new_ch), Image.LANCZOS).convert("RGB")
    
    cx = (width - new_cw) // 2
    cy = (height - new_ch) // 2
    canvas.paste(resized_cover, (cx, cy))
    
    # Overlay oscuro semi-transparente
    overlay = Image.new("RGBA", (width, height), (3, 7, 18, 140))
    canvas = canvas.convert("RGBA")
    canvas = Image.alpha_composite(canvas, overlay)
    
    # Logo en el centro superior-medio
    logo_w_target = int(width * 0.65)
    lw, lh = logo.size
    scale_l = logo_w_target / lw
    new_lh = int(lh * scale_l)
    
    max_logo_h = int(height * 0.2)
    if new_lh > max_logo_h:
        scale_l = max_logo_h / lh
        logo_w_target = int(lw * scale_l)
        new_lh = max_logo_h
    
    resized_logo = logo.resize((logo_w_target, new_lh), Image.LANCZOS)
    lx = (width - logo_w_target) // 2
    ly = int(height * 0.35)
    canvas.paste(resized_logo, (lx, ly), resized_logo)
    
    return canvas.convert("RGB")

# Splashscreens iOS comunes
SPLASH_SIZES = [
    (640, 1136, "iphone5"),
    (750, 1334, "iphone6"),
    (828, 1792, "iphoneXR"),
    (1125, 2436, "iphoneX"),
    (1242, 2208, "iphone6plus"),
    (1242, 2688, "iphoneXSmax"),
    (1536, 2048, "ipad"),
    (1668, 2388, "ipadPro11"),
    (2048, 2732, "ipadPro12"),
]

SPLASH_DIR = os.path.join(ASSETS_DIR, "splash")
os.makedirs(SPLASH_DIR, exist_ok=True)

for w, h, name in SPLASH_SIZES:
    splash = make_splash(w, h, name)
    splash_path = os.path.join(SPLASH_DIR, f"splash-{w}x{h}.png")
    splash.save(splash_path, "PNG", optimize=True)
    print(f"  ✓ splash-{w}x{h}.png ({name})")

print("\n✅ Todos los assets PWA generados exitosamente.")
