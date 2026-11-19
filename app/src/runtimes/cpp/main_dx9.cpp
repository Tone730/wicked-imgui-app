// main_dx9.cpp - OFFLINE COMPATIBILITY STUB host for the DirectX 9 backend.
//
// Skeleton only: no IDirect3DDevice9, no ImGui_ImplDX9 implementation. The real
// full-access runtime supplies those; this file keeps offline exports shaped
// like a normal Win32/DX9 program. CPP_BUILD maps dx9 to this exact filename.

#include "kavro.h"
#include "kavro_win32.h"

void KavroRegisterAssets() {
    // No embedded assets in the local/offline compatibility build.
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR, int nCmdShow) {
    (void)hInstance;
    (void)nCmdShow;

    // Real host: create a window + IDirect3DDevice9, then
    // ImGui::CreateContext(); ImGui_ImplWin32_Init(hwnd); ImGui_ImplDX9_Init(device);
    KavroConfigure();
    KavroRegisterAssets();
    kv::Init();

    for (;;) {
        // TODO(real backend): ImGui_ImplWin32_NewFrame(); ImGui_ImplDX9_NewFrame();
        // TODO(real backend): ImGui::NewFrame();
        kv::Frame();
        // TODO(real backend): ImGui::Render(); ImGui_ImplDX9_RenderDrawData(); Present();
        break; // placeholder frame
    }
    return 0;
}
