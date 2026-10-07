import sys
import time
import subprocess
import os
from playwright.sync_api import sync_playwright

def run_tests():
    print("🌐 Lanzando navegador Chromium...")
    errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )

        # TEST 1: Desktop Viewport (1280x800)
        print("\n--- TEST 1: Desktop SplashScreen, Hub, 4 Operaciones & Curvas de Nivel ---")
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        page_errors = []
        page.on("pageerror", lambda err: print(f"❌ [Browser PageError]: {err}") or page_errors.append(f"PageError: {err}"))
        page.on("console", lambda msg: print(f"📝 [Console {msg.type}]: {msg.text}") or (page_errors.append(f"ConsoleError: {msg.text}") if msg.type == "error" else None))

        page.goto("http://127.0.0.1:8086/")
        
        # 1.0 Verificar SplashScreen exclusiva y Portada
        print("🖼️ Verificando SplashScreen aislada...")
        page.wait_for_selector("#splashScreen:not(.hidden)", timeout=5000)
        assert page.is_visible(".splash-cover-img"), "La portada en SplashScreen no está visible"
        assert page.is_visible(".splash-logo-img"), "El logo en SplashScreen no está visible"
        assert not page.is_visible("#menuScreen:not(.hidden)"), "El Menú no debe verse mientras está el Splash"

        # 1.1 Iniciar la Aventura (Transición hacia Menú)
        print("🚀 Pulsando 'INICIAR AVENTURA'...")
        page.click("#btnStartAdventure")
        time.sleep(0.4)
        assert not page.is_visible("#splashScreen:not(.hidden)"), "El SplashScreen debe haberse ocultado"
        assert page.is_visible("#menuScreen"), "El Menú debe revelarse"

        # 1.2 Verificar Logotipo Completo Horizontal en el Menú (No avatar)
        print("🏷️ Verificando Logotipo Completo en el Menú Principal...")
        assert page.is_visible(".brand-logo-full"), "El logo completo no está visible en el Menú"
        # Verificar que la portada YA NO esté en el menú
        assert not page.is_visible("#menuScreen .game-cover-img"), "La portada NO debe estar en el menú principal"

        # 1.3 Verificar Grilla de las 4 Operaciones y Selector Andamiado
        print("✨ Probando las 4 operaciones en el Hub...")
        page.wait_for_selector("#operationsGrid .operation-card", timeout=5000)
        op_cards = page.query_selector_all("#operationsGrid .operation-card")
        assert len(op_cards) == 4, f"Se esperaban 4 tarjetas de operaciones, se encontraron {len(op_cards)}"

        # Probar selección de Curva de Nivel Andamiado (Nivel 1, Nivel 2, Nivel 3)
        print("🌱 Probando cambio de niveles andamiados (Iniciación, Exploración, Maestría)...")
        page.click("button[data-level='2']")
        time.sleep(0.2)
        page.click("button[data-level='3']")
        time.sleep(0.2)
        page.click("button[data-level='1']")
        time.sleep(0.2)

        # Probar lanzamiento de Resta Estelar (Nivel 1 Iniciación)
        print("➖ Lanzando partida de Resta Estelar (Nivel 1)...")
        page.query_selector_all("#operationsGrid .operation-card")[1].click()
        time.sleep(1.2)
        hud_symbol = page.text_content("#hudOpSym")
        print(f"✅ Símbolo HUD detectado en Resta: '{hud_symbol}'")
        assert hud_symbol == "−", "El símbolo en HUD debería ser −"
        page.click("#btnBackToMenu")
        time.sleep(0.5)

        # Probar lanzamiento de División Cuántica (Nivel 1 Iniciación)
        print("➗ Lanzando partida de División Cuántica (Nivel 1)...")
        page.query_selector_all("#operationsGrid .operation-card")[3].click()
        time.sleep(1.8)
        hud_symbol = page.text_content("#hudOpSym")
        print(f"✅ Símbolo HUD detectado en División: '{hud_symbol}'")
        assert hud_symbol == "÷", f"El símbolo en HUD debería ser ÷, pero se encontró '{hud_symbol}'"
        page.click("#btnBackToMenu")
        time.sleep(0.5)

        # 1.4 Probar Modo Tablas 1..12
        print("📚 Probando cambio de modo a 'Tablas 1..12'...")
        page.click("#tabModeSingle")
        page.wait_for_selector("#singleTablesGrid .single-table-card", timeout=5000)
        table_cards = page.query_selector_all("#singleTablesGrid .single-table-card")
        assert len(table_cards) == 12, "Deberían haber 12 tablas individuales"

        # 1.5 Probar Salón de la Fama
        print("🏆 Probando apertura del Salón de la Fama...")
        page.click("#tabModeLeaderboard")
        page.wait_for_selector("#leaderboardModal:not(.hidden)", timeout=5000)
        page.click("#btnCloseLeaderboard")
        time.sleep(0.3)

        # 1.6 Probar Créditos y Referencias Científicas
        print("📜 Probando apertura de Créditos & Neurociencia...")
        page.click("#tabModeCredits")
        page.wait_for_selector("#creditsModal:not(.hidden)", timeout=5000)
        credits_text = page.text_content("#creditsModal")
        assert "Juan Tomoo" in credits_text, "Créditos a Juan Tomoo faltantes"
        assert "Todos los derechos reservados" in credits_text, "Mención de derechos faltante"
        page.click("#btnCloseCredits")
        time.sleep(0.3)

        if page_errors:
            print(f"❌ Errores en Desktop: {page_errors}")
            errors.extend(page_errors)
        else:
            print("✅ Test Desktop completado con éxito.")

        # TEST 2: Mobile Viewport Touch (390x844)
        print("\n--- TEST 2: Mobile SplashScreen & Touch Emulation ---")
        mobile_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            has_touch=True,
            is_mobile=True
        )
        mobile_page = mobile_context.new_page()
        mobile_errors = []
        mobile_page.on("pageerror", lambda err: print(f"❌ [Mobile PageError]: {err}") or mobile_errors.append(f"PageError: {err}"))
        mobile_page.on("console", lambda msg: print(f"📱 [Mobile Console {msg.type}]: {msg.text}") or (mobile_errors.append(f"ConsoleError: {msg.text}") if msg.type == "error" else None))

        mobile_page.goto("http://127.0.0.1:8086/")
        mobile_page.wait_for_selector("#splashScreen:not(.hidden)", timeout=5000)
        
        print("📱 Verificando SplashScreen en móvil...")
        assert mobile_page.is_visible(".splash-cover-img"), "Portada de splash no visible en mobile"
        
        print("📱 Tocando 'INICIAR AVENTURA' en móvil...")
        mobile_page.tap("#btnStartAdventure")
        time.sleep(0.4)

        print("📱 Verificando logotipo completo en móvil...")
        assert mobile_page.is_visible(".brand-logo-full"), "Logo completo no visible en mobile"

        print("📱 Tocando selector de nivel 1 en móvil...")
        mobile_page.tap("button[data-level='1']")
        time.sleep(0.2)

        print("📱 Tocando primera operación (Suma Cósmica Nivel 1) en móvil...")
        mobile_op_cards = mobile_page.query_selector_all("#operationsGrid .operation-card")
        mobile_op_cards[0].tap()
        time.sleep(1)

        # Toques táctiles en los 3 carriles
        box = mobile_page.locator("#pulseCanvas").bounding_box()
        assert box is not None
        y_tap = box["y"] + box["height"] * 0.75
        mobile_page.touchscreen.tap(box["x"] + box["width"] * 0.15, y_tap)
        time.sleep(0.3)
        mobile_page.touchscreen.tap(box["x"] + box["width"] * 0.85, y_tap)
        time.sleep(0.3)

        # Regreso
        mobile_page.tap("#btnBackToMenu")
        time.sleep(0.5)

        if mobile_errors:
            print(f"❌ Errores en Mobile: {mobile_errors}")
            errors.extend(mobile_errors)
        else:
            print("✅ Test Mobile completado con éxito.")

        browser.close()

    if errors:
        print(f"\n❌ Se encontraron {len(errors)} errores.")
        sys.exit(1)
    else:
        print("\n🎉 TODOS LOS TESTS DE SPLASH SCREEN, LOGO COMPLETO, NIVELES ANDAMIADOS Y MÓVIL PASARON CON ÉXITO.")
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
