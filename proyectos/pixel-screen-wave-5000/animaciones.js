window.ANIMATIONS_DATA = {
    "nature": {
        "label": "Naturaleza y Clima",
        "effects": [
            {
                "name": "Lluvia Suave",
                "code": "const drop = (x * 13 + t * 5 + y) % 20;\nreturn drop > 18 ? 1 : 0;"
            },
            {
                "name": "Lluvia Matrix",
                "code": "// Columnas aleatorias cayendo\nconst speed = 2;\nconst offset = Math.sin(x * 999) * 100;\nconst tail = (y + t * speed + offset) % 15;\nreturn tail < 2 ? 1 : tail < 8 ? 0.3 : 0;"
            },
            {
                "name": "Nieve",
                "code": "const noise = Math.sin(x * 12.98 + y * 78.23 + t);\nreturn noise > 0.95 ? 1 : 0;"
            },
            {
                "name": "Tormenta (Rayos)",
                "code": "const flash = Math.random() > 0.98 ? 1 : 0;\nconst bolt = Math.abs(x - (cols/2 + Math.sin(y/5)*5)) < 1;\nreturn (flash && bolt) ? 1 : 0;"
            },
            {
                "name": "Fuego",
                "code": "const noise = Math.sin(x * 0.5 + y * 0.1 + t * 2);\nconst decay = y / rows;\nreturn (noise > decay) && (y > rows/2) ? 1 : 0;"
            },
            {
                "name": "Olas de Mar",
                "code": "const surface = rows/2 + Math.sin(x/5 + t*2) * 5;\nreturn y > surface ? 1 : 0;"
            },
            {
                "name": "Viento",
                "code": "const gust = Math.sin(y * 99 + t * 5) + Math.sin(x/10);\nreturn Math.abs(gust) > 1.8 ? 0.5 : 0;"
            },
            {
                "name": "Nubes",
                "code": "const v = Math.sin(x/8 + t/2) + Math.sin(y/6);\nreturn v > 1 ? 1 : 0;"
            },
            {
                "name": "Estrellas",
                "code": "const star = Math.sin(x * 55 + y * 12);\nconst twinkle = Math.sin(t * 5 + x);\nreturn (star > 0.95 && twinkle > 0) ? 1 : 0;"
            },
            {
                "name": "Eclipse",
                "code": "const cx = cols/2, cy = rows/2;\nconst sun = Math.sqrt((x-cx)**2 + (y-cy)**2) < 10;\nconst moonX = cx - 12 + (t*2)%24;\nconst moon = Math.sqrt((x-moonX)**2 + (y-cy)**2) < 9;\nreturn (sun && !moon) ? 1 : (sun && moon) ? 0.2 : 0;"
            }
        ]
    },
    "emojis": {
        "label": "Emojis y Caras",
        "effects": [
            {
                "name": "Corazón Latiente",
                "code": "const cx = cols/2, cy = rows/2;\nconst sc = 4 + Math.sin(t*5);\nconst px = (x-cx)/sc, py = -(y-cy)/sc;\nconst heart = Math.pow(px*px+py*py-1, 3) - px*px*Math.pow(py,3);\nreturn heart <= 0 ? 1 : 0;"
            },
            {
                "name": "Carita Feliz",
                "code": "const cx = cols/2, cy = rows/2;\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nconst eyes = (Math.abs(x-cx-4)<2 || Math.abs(x-cx+4)<2) && Math.abs(y-cy+4)<2;\nconst mouth = d<8 && d>6 && y>cy;\nreturn (d<12 && !eyes && !mouth) ? 1 : 0;"
            },
            {
                "name": "Fantasma",
                "code": "const cx=cols/2, cy=rows/2 + Math.sin(t*3)*2;\nconst body = Math.abs(x-cx) < 6 && y < cy+6 && y > cy-6;\nconst head = Math.sqrt((x-cx)**2 + (y-(cy-6))**2) < 6;\nreturn (body || head) ? 1 : 0;"
            },
            {
                "name": "Pacman",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nconst a = Math.atan2(y-cy, x-cx);\nconst mouth = Math.abs(a) < Math.abs(Math.sin(t*5));\nreturn (d<8 && !mouth) ? 1 : 0;"
            },
            {
                "name": "Ojo Observador",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nconst px = cx + Math.cos(t)*3, py = cy + Math.sin(t)*3;\nconst pupil = Math.sqrt((x-px)**2+(y-py)**2);\nreturn (d<8 && pupil>3) ? 1 : 0;"
            },
            {
                "name": "Calavera",
                "code": "const cx=cols/2, cy=rows/2;\nconst head = Math.sqrt((x-cx)**2+(y-cy+2)**2) < 7;\nconst jaw = Math.abs(x-cx) < 4 && y > cy+2 && y < cy+7;\nconst eyes = (Math.abs(x-cx-3)<2 || Math.abs(x-cx+3)<2) && Math.abs(y-cy)<2;\nreturn ((head||jaw) && !eyes) ? 1 : 0;"
            },
            {
                "name": "Alien",
                "code": "const cx=cols/2, cy=rows/2;\nconst w = Math.abs(x-cx);\nconst head = w<6 && Math.abs(y-cy)<5;\nconst eyes = w>2 && w<5 && y==cy;\nreturn (head && !eyes) ? 1 : 0;"
            },
            {
                "name": "Sol Giratorio",
                "code": "const cx=cols/2, cy=rows/2;\nconst a = Math.atan2(y-cy, x-cx);\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nconst rays = Math.sin(a*8 + t) > 0.5;\nreturn (d<5 || (d>7 && rays)) ? 1 : 0;"
            },
            {
                "name": "Nota Musical",
                "code": "const cx=cols/2, cy=rows/2;\nconst stem = x==cx && y<cy+4 && y>cy-6;\nconst bulb = Math.sqrt((x-(cx-2))**2 + (y-(cy+4))**2) < 3;\nconst flag = x>=cx && x<cx+4 && y==cy-6+Math.abs(x-cx);\nreturn (stem || bulb || flag) ? 1 : 0;"
            },
            {
                "name": "Diamante",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.abs(x-cx) + Math.abs(y-cy);\nconst sparkle = Math.sin(t*10 + x) > 0.8;\nreturn (d < 10) ? (sparkle ? 0.5 : 1) : 0;"
            }
        ]
    },
    "abstract": {
        "label": "Abstracto y Geometría",
        "effects": [
            {
                "name": "Espiral Hipnótica",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nconst a = Math.atan2(y-cy, x-cx);\nreturn Math.sin(d/2 + a*4 - t*5) > 0 ? 1 : 0;"
            },
            {
                "name": "Túnel Cuadrado",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.max(Math.abs(x-cx), Math.abs(y-cy));\nreturn Math.floor(100/(d+1) + t*2) % 2 == 0 ? 1 : 0;"
            },
            {
                "name": "Plasma",
                "code": "const v = Math.sin(x/5+t) + Math.sin(y/5+t) + Math.sin((x+y)/5+t);\nreturn (v + 3) / 6;"
            },
            {
                "name": "Ajedrez Móvil",
                "code": "const check = Math.floor((x+t*5)/8) + Math.floor(y/8);\nreturn check % 2 == 0 ? 1 : 0;"
            },
            {
                "name": "Ripples (Gotas)",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.sqrt((x-cx)**2 + (y-cy)**2);\nreturn Math.sin(d - t*5) > 0.5 ? 1 : 0;"
            },
            {
                "name": "Moiré XOR",
                "code": "return ((x ^ y) + Math.floor(t*10)) % 9 < 4 ? 1 : 0;"
            },
            {
                "name": "Caleidoscopio",
                "code": "const cx=cols/2, cy=rows/2;\nconst a = Math.abs(Math.atan2(y-cy, x-cx));\nreturn Math.sin(a*10 + t) > 0.5 ? 1 : 0;"
            },
            {
                "name": "Metabolas (Lava)",
                "code": "const b1 = 5 / Math.sqrt((x-10-Math.sin(t)*10)**2 + (y-16)**2);\nconst b2 = 5 / Math.sqrt((x-22)**2 + (y-16-Math.cos(t)*10)**2);\nreturn (b1+b2) > 0.5 ? 1 : 0;"
            },
            {
                "name": "Ruido TV",
                "code": "return Math.random();"
            },
            {
                "name": "Fractal Zoom",
                "code": "const cx=cols/2, cy=rows/2;\nconst z = 1 + Math.sin(t)*0.5;\nreturn ((Math.floor((x-cx)*z) ^ Math.floor((y-cy)*z)) % 7) == 0 ? 1 : 0;"
            }
        ]
    },
    "ui": {
        "label": "UI y Utilidades",
        "effects": [
            {
                "name": "Reloj Analógico",
                "code": "const cx=cols/2, cy=rows/2, a=Math.atan2(y-cy, x-cx);\nconst h = Math.abs(a - t%6.28) < 0.2 && Math.sqrt((x-cx)**2+(y-cy)**2)<8;\nreturn h ? 1 : (Math.sqrt((x-cx)**2+(y-cy)**2)>14 ? 1 : 0);"
            },
            {
                "name": "Cargando (Spinner)",
                "code": "const cx=cols/2, cy=rows/2;\nconst a = Math.atan2(y-cy, x-cx);\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nreturn (d>8 && d<12 && (a+3.14) < (t*5)%6.28) ? 1 : 0;"
            },
            {
                "name": "Barra de Progreso",
                "code": "const w = cols * ((Math.sin(t)+1)/2);\nreturn (Math.abs(y-rows/2)<4 && x < w) ? 1 : 0;"
            },
            {
                "name": "Wifi Signal",
                "code": "const cx=cols/2, cy=rows-2;\nconst d = Math.sqrt((x-cx)**2 + (y-cy)**2);\nconst wave = Math.floor(d/4);\nconst active = wave < (t%5);\nreturn (d<cols/2 && y<cy && d%4<2 && active) ? 1 : 0;"
            },
            {
                "name": "Batería",
                "code": "const body = x>5 && x<25 && y>10 && y<22;\nconst tip = x>=25 && x<27 && y>13 && y<19;\nconst fill = x>7 && x<(7 + (t%5)*4) && y>12 && y<20;\nreturn (fill || (!fill && (body||tip) && (x<7 || x>23 || y<12 || y>20))) ? 1 : 0;"
            },
            {
                "name": "Latido ECG",
                "code": "const pulseX = (t * 20) % cols;\nconst pulseY = rows/2 + (Math.abs(x - pulseX) < 2 ? (Math.sin(x)*10) : 0);\nreturn Math.abs(y - pulseY) < 1 ? 1 : 0;"
            },
            {
                "name": "Volumen",
                "code": "const cx=10, cy=rows/2;\nconst spk = x<cx && Math.abs(y-cy) < x/2;\nconst wave = Math.sqrt((x-cx)**2+(y-cy)**2);\nreturn (spk || (x>cx && Math.sin(wave-t*5)>0.8)) ? 1 : 0;"
            },
            {
                "name": "Cursor Flecha",
                "code": "const mx = (cols/2) + Math.sin(t)*10;\nconst my = (rows/2) + Math.cos(t)*10;\nreturn (x > mx && x < mx+5 && y > my && y < my+5) ? 1 : 0;"
            },
            {
                "name": "Gráfica de Barras",
                "code": "const h = Math.abs(Math.sin(x/4 + t) * rows/2);\nreturn (y > rows - h) ? 1 : 0;"
            },
            {
                "name": "Radar Sonar",
                "code": "const cx=cols/2, cy=rows/2;\nconst a = Math.atan2(y-cy, x-cx);\nconst sw = ((a + Math.PI) - (t*2 % 6.28));\nreturn (Math.abs(sw) < 0.5 || Math.sqrt((x-cx)**2+(y-cy)**2)%10<1) ? 1 : 0;"
            }
        ]
    },
    "scifi": {
        "label": "Sci-Fi y Espacio",
        "effects": [
            {
                "name": "Agujero Negro",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nconst eventHorizon = 6 + Math.sin(t*10)*0.5;\nreturn (d > eventHorizon && d < eventHorizon + 4) ? 1 : 0;"
            },
            {
                "name": "Rayo Láser",
                "code": "const beamY = rows/2;\nconst core = Math.abs(y - beamY) < 2;\nconst glow = Math.abs(y - beamY) < 5 && Math.random() > 0.5;\nreturn (core || glow) ? 1 : 0;"
            },
            {
                "name": "Campo de Fuerza",
                "code": "const cx=cols/2, cy=rows/2;\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nconst act = Math.abs(d - 12) < 1 && (Math.sin(Math.atan2(y-cy, x-cx)*10 + t*5) > 0);\nreturn act ? 1 : 0;"
            },
            {
                "name": "Salto Hiperespacio",
                "code": "const cx=cols/2, cy=rows/2;\nconst a = Math.atan2(y-cy, x-cx);\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nreturn Math.sin(a*10 + d - t*20) > 0.8 ? 1 : 0;"
            },
            {
                "name": "UFO",
                "code": "const cx=cols/2, cy=rows/2 + Math.sin(t)*3;\nconst saucer = Math.abs(x-cx) < 10 && Math.abs(y-cy) < 3;\nconst dome = Math.abs(x-cx) < 4 && y < cy;\nconst beam = Math.abs(x-cx) < (y-cy) && y > cy+2 && Math.random()>0.5;\nreturn (saucer || dome || beam) ? 1 : 0;"
            },
            {
                "name": "Explosión",
                "code": "const cx=cols/2, cy=rows/2;\nconst r = (t*10)%25;\nconst d = Math.sqrt((x-cx)**2+(y-cy)**2);\nreturn (Math.abs(d-r) < 2 && Math.random()>0.3) ? 1 : 0;"
            },
            {
                "name": "Scanner Digital",
                "code": "const scanX = (t * 20) % cols;\nreturn Math.abs(x - scanX) < 2 ? 1 : (x < scanX ? 0.2 : 0);"
            },
            {
                "name": "Glitch Art",
                "code": "const offset = Math.random() > 0.9 ? 5 : 0;\nreturn ((x+offset) % 4 == 0) ? 1 : 0;"
            },
            {
                "name": "ADN",
                "code": "const phase = x/5 + t;\nconst y1 = rows/2 + Math.sin(phase)*5;\nconst y2 = rows/2 - Math.sin(phase)*5;\nreturn (Math.abs(y-y1)<1.5 || Math.abs(y-y2)<1.5) ? 1 : 0;"
            },
            {
                "name": "Cohete",
                "code": "const cx=cols/2, cy=rows-t*10 % (rows+20);\nconst body = Math.abs(x-cx)<2 && Math.abs(y-cy)<6;\nconst fire = Math.abs(x-cx)<Math.abs(y-cy-8) && y>cy+6 && Math.random()>0.5;\nreturn (body || fire) ? 1 : 0;"
            }
        ]
    }
};
