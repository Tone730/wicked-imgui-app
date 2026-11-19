// main_dx12.cpp - OFFLINE COMPATIBILITY STUB host for the DirectX 12 backend.
//
// Skeleton only: no device/command queue, descriptor heaps or ImGui_ImplDX12
// setup lives here. The full-access runtime provides those. This file only
// demonstrates where generated configuration and frames fit in a DX12 host.
// CPP_BUILD maps dx12 to this exact filename.

#include "kavro.h"
#include "kavro_win32.h"

void KavroRegisterAssets() {
    // No embedded assets in the local/offline compatibility build.
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR, int nCmdShow) {
    (void)hInstance;
    (void)nCmdShow;

    // Real host: create D3D12 device + swap chain + command queue, an SRV heap,
    // then ImGui_ImplWin32_Init(), ImGui_ImplDX12_Init(device, ..., srvHeap, ...).
    KavroConfigure();
    KavroRegisterAssets();
    kv::Init();

    for (;;) {
        // TODO(real backend): begin frame + ImGui_ImplWin32_NewFrame();
        // TODO(real backend): ImGui_ImplDX12_NewFrame(); ImGui::NewFrame();
        kv::Frame();
        // TODO(real backend): ImGui::Render(); ImGui_ImplDX12_RenderDrawData(); Present();
        break; // placeholder frame
    }
    return 0;
}
