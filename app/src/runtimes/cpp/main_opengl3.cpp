// main_opengl3.cpp - OFFLINE COMPATIBILITY STUB host for OpenGL 3 + GLFW.
//
// Skeleton only: GLFW window creation, GL context setup and ImGui_ImplGlfw /
// ImGui_ImplOpenGL3 are intentionally left as comments. The full-access runtime
// provides a complete host; keep this filename (CPP_BUILD maps opengl3 to it).

#include "kavro.h"

void KavroRegisterAssets() {
    // No embedded assets in the local/offline compatibility build.
}

int main(int argc, char** argv) {
    (void)argc;
    (void)argv;

    // Real host: glfwInit(); create a 3.3 core window + context;
    // ImGui::CreateContext(); ImGui_ImplGlfw_InitForOpenGL(window, true);
    // ImGui_ImplOpenGL3_Init("#version 130");
    KavroConfigure();
    KavroRegisterAssets();
    kv::Init();

    for (;;) {
        // TODO(real backend): ImGui_ImplOpenGL3_NewFrame(); ImGui_ImplGlfw_NewFrame();
        // TODO(real backend): ImGui::NewFrame();
        kv::Frame();
        // TODO(real backend): ImGui::Render(); ImGui_ImplOpenGL3_RenderDrawData();
        // TODO(real backend): glfwSwapBuffers(window); glfwPollEvents();
        break; // placeholder frame
    }
    return 0;
}
