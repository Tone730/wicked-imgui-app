// main_vulkan.cpp - OFFLINE COMPATIBILITY STUB host for the Vulkan backend.
//
// Skeleton only: no VkInstance/device/swapchain/render pass and no
// ImGui_ImplVulkan setup is implemented here. The full-access runtime ships a
// complete host. CPP_BUILD maps vulkan to this exact filename.

#include "kavro.h"
#include "kavro_win32.h"

void KavroRegisterAssets() {
    // No embedded assets in the local/offline compatibility build.
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR, int nCmdShow) {
    (void)hInstance;
    (void)nCmdShow;

    // Real host: create a Win32 surface, VkInstance, physical/logical device,
    // swapchain, render pass and descriptor pool, then
    // ImGui_ImplWin32_Init() + ImGui_ImplVulkan_Init().
    KavroConfigure();
    KavroRegisterAssets();
    kv::Init();

    for (;;) {
        // TODO(real backend): acquire image, ImGui_ImplVulkan_NewFrame();
        // TODO(real backend): ImGui_ImplWin32_NewFrame(); ImGui::NewFrame();
        kv::Frame();
        // TODO(real backend): ImGui::Render(); ImGui_ImplVulkan_RenderDrawData();
        // TODO(real backend): queue submit + vkQueuePresentKHR();
        break; // placeholder frame
    }
    return 0;
}
