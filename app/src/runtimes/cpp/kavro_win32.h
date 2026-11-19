// kavro_win32.h - LOCAL / OFFLINE COMPATIBILITY STUB.
//
// Minimal Win32 helpers for the exported C++ host skeletons. This is not a
// windowing/backend implementation; it only supplies the declarations and
// macros the host main*.cpp files need to show their intended shape offline.
// Filename is part of the generated-project contract - do not rename it.

#ifndef KAVRO_WIN32_H_INCLUDED
#define KAVRO_WIN32_H_INCLUDED

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#ifndef NOMINMAX
#define NOMINMAX
#endif

#include <windows.h>

#define KAVRO_WND_CLASS_NAME "KavroOfflineStub"
#define KAVRO_WND_TITLE      "Wicked ImGui Maker (offline stub)"
#define KAVRO_WND_STYLE      (WS_OVERLAPPEDWINDOW)
#define KAVRO_HIWORD(x)      ((unsigned short)(((unsigned long)(x)) >> 16))

namespace kvwin {

// Offline-friendly shims: safe no-ops/defaults when no real window exists.
HWND  GetHostWindow();
bool  IsKeyDown(int virtualKey);
bool  IsMouseButtonDown(int button);
void  GetMousePos(int* x, int* y);
float GetDpiScale(HWND hwnd);
bool  CenterWindow(HWND hwnd, int width, int height);
LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);

} // namespace kvwin

#endif // KAVRO_WIN32_H_INCLUDED
