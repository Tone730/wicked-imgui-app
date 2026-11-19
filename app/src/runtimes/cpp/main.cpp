// main.cpp - OFFLINE COMPATIBILITY STUB host for the DirectX 11 backend.
//
// This file is a host skeleton only. It is intentionally NOT a complete
// Dear ImGui / DX11 backend: no device, swap chain or ImGui_ImplDX11 calls are
// implemented here. A real full-access build ships a complete host; this one
// exists so exported source has a recognizable program shape offline.
// Keep the filename: CPP_BUILD maps the dx11 backend to main.cpp.

#include "kavro.h"
#include "kavro_win32.h"

// In a real export, generated assets provide this. Our offline stub has none.
void KavroRegisterAssets() {
    // No embedded assets in the local/offline compatibility build.
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR, int nCmdShow) {
    (void)hInstance;
    (void)nCmdShow;

    // Real host: create the Win32 window, ID3D11Device/swap chain, then
    // ImGui::CreateContext(); ImGui_ImplWin32_Init(hwnd); ImGui_ImplDX11_Init(device, ctx);
    KavroConfigure();      // generated project.cpp: config + pages + styles
    KavroRegisterAssets(); // stub above
    kv::Init();

    for (;;) {
        // TODO(real backend): ImGui_ImplWin32_NewFrame(); ImGui_ImplDX11_NewFrame();
        // TODO(real backend): ImGui::NewFrame();
        kv::Frame();       // draws the pages registered by KavroConfigure()
        // TODO(real backend): ImGui::Render(); ImGui_ImplDX11_RenderData(); Present();
        break;             // placeholder: remove when a real backend is wired up
    }
    return 0;
}
