// kavro.h - LOCAL / OFFLINE COMPATIBILITY STUB (not the encrypted shipped runtime).
//
// This header exists so "Export Source" / "Build & Run" can populate the UI
// offline in a local full-access build. It declares the same public surface
// that generated projects expect; it is NOT a full Dear ImGui implementation.
// The legacy filename and kv:: / Kavro* identifiers are generated-code contracts,
// not branding; ui.cpp, project.cpp and the host .cpp files include "kavro.h".
//
// Implementation note: the shipped single-header runtime compiles its body in
// exactly one translation unit by defining KAVRO_IMPLEMENTATION in kavro_impl.cpp.
// Older templates spell that switch WICKED_IMPLEMENTATION:
//     // #define WICKED_IMPLEMENTATION   (legacy alias - do not use here)
// This stub is declarations-only, so no implementation macro is required.
//
// New design-time widgets (badge, stat, rating, stepper, breadcrumb) are emitted
// by the generator as these existing calls, so no new runtime symbols are needed.

#ifndef KAVRO_H_INCLUDED
#define KAVRO_H_INCLUDED

#include <string>
#include <unordered_map>
#include <vector>

namespace kv {

struct Vec2 { float x, y; };

struct Area {
    const char* id;
    const char* text;
    Vec2 pos;
    Vec2 size;
};

struct FontReq { float size; bool bold; int family; int asset; };

struct WindowCfg {
    int width = 1280, height = 720;
    const char* title = "Wicked ImGui Maker";
    bool borderless = false, resizable = true, topmost = false, centered = true;
    float rounding = 8.0f, borderSize = 1.0f;
    unsigned borderColor = 0u, bg = 0xff11151eu, bg2 = 0u;
    int bgType = 0, bgDir = 0, bgImage = -1;
    float bgImageOpacity = 1.0f;
    int openAnim = 0, pageAnim = 0, dragMode = 0;
    float openDur = 0.3f, pageDur = 0.25f;
    bool fullscreen = false, fsKey = false, animations = true;
};

struct TitlebarCfg {
    bool enabled = true, gradient = false, showTitle = true, titleBold = false;
    float height = 32.0f, titleSize = 14.0f, iconSize = 16.0f;
    unsigned bg = 0u, bg2 = 0u, titleColor = 0xffffffffu;
    const char* title = "";
    int align = 1, icon = -1, buttons = 0, line = 0;
    bool showMinimize = true, showClose = true, draggable = true;
    unsigned btnColor = 0u, btnHover = 0u, closeHover = 0u, lineColor = 0u;
};

struct BackgroundCfg {
    int effect = 0, count = 40;
    float speed = 1.0f, size = 2.0f, opacity = 0.5f, linkDist = 120.0f;
    unsigned color = 0u, color2 = 0u;
    bool mouse = true;
};

struct ThemeCfg {
    float fontSize = 14.0f;
    int font = 0, fontAsset = -1, toastPos = 0;
    unsigned toastBg = 0u, text = 0xffffffffu, textDim = 0xff9ca3afu;
    unsigned accent = 0xff00e0b8u, accent2 = 0xff8b5cf6u;
    unsigned frame = 0xff1c2230u, border = 0xff2a3245u;
};

struct ToastCfg {
    int area = 0, pos = 0, maxVisible = 4, anim = 0, icon = -1, accent = 0, align = 0;
    float offX = 12.0f, offY = 12.0f, duration = 3.0f, animDur = 0.25f;
    bool progress = false, borderKind = false, shadow = true, bold = false;
    unsigned bg = 0u, text = 0xffffffffu, border = 0u;
    unsigned cInfo = 0u, cSuccess = 0u, cWarning = 0u, cError = 0u, progressColor = 0u;
    float width = 280.0f, height = 56.0f, padding = 12.0f, rounding = 8.0f;
    float borderSize = 1.0f, gap = 8.0f, iconSize = 18.0f, fontSize = 13.0f;
    unsigned outline = 0u, tshadow = 0u;
    float outlineSize = 0.0f, tshadowX = 0.0f, tshadowY = 0.0f, shadowSize = 8.0f;
    unsigned shadowColor = 0u;
};

struct Config {
    WindowCfg window;
    TitlebarCfg titlebar;
    BackgroundCfg background;
    ThemeCfg theme;
    ToastCfg toast;
    std::vector<FontReq> fonts;
    std::string startPage;
};

struct WidgetStyle {
    float opacity = 1.0f, animDelay = 0.0f, animDur = 0.4f, animSpeed = 1.0f;
    float fontSize = 0.0f, rounding = 0.0f, borderSize = 0.0f, letterSpacing = 0.0f;
    int anim = 0, align = 0, variant = 0, gradDir = 0, wrap = 0, font = 0, fontAsset = -1;
    bool bold = false, underline = false, gradient = false, disabled = false;
    bool visible = true, handCursor = false, noAnim = false;
    unsigned color = 0u, color2 = 0u, bg = 0u, bg2 = 0u, bgHover = 0u, bgActive = 0u;
    unsigned text = 0u, textActive = 0u, border = 0u, outline = 0u, tshadow = 0u;
    float outlineSize = 0.0f, tshadowX = 0.0f, tshadowY = 0.0f;
    std::string visibleIf, enabledIf, tooltip, parent;
};

// Configuration / setup used by generated project.cpp.
Config& cfg();
void Init();
void Frame();
WidgetStyle& Def(const char* id);
WidgetStyle& Def(const std::string& id);
void AddPage(const char* id, const char* name, void (*page)());

// Asset registration used by generated kavro_assets.h. The arrays live in the
// generated header; this stub only stores their pointers locally.
struct Asset { const unsigned char* data; int size; };
void AddAsset(int index, const unsigned char* data, int size);

// Generated project.cpp calls this; the real implementation lives in the
// generated asset header / full runtime. This stub just declares the symbol.
void KavroRegisterAssets();

// State helpers used by generated actions and conditions.
bool GetBool(const char* id);
float GetFloat(const char* id);
int GetInt(const char* id);
std::string GetText(const char* id);
void Set(const char* id, const char* value);

// Actions used by generated widget callbacks.
void GoTo(const char* page);
void Toast(const char* text, const char* kind);
void Load(const char* target, float seconds, const char* page);
void Login(const char* userField, const char* passField, const char* user,
           const char* pass, const char* page, const char* error);
void KeyLogin(const char* keyField, const char* keys, const char* page, const char* error);
void Toggle(const char* target);
void OpenUrl(const char* url);
void Webhook(const char* url, const char* payload, const char* method);
void Discord(const char* url, const char* message, const char* username);
void Run(const char* path);
void Copy(const char* text);
void Minimize();
void Close();
void Fullscreen();

// Widget calls emitted for every design-time widget type. All return bool so
// generated `if (kv::X(...)) { action; }` blocks keep working. Positions/sizes
// are braced aggregates: {x, y} / {width, height}.
bool Text(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Button(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Checkbox(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Switch(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Slider(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Input(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Combo(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Progress(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Separator(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Image(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Panel(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Tabs(const char* id, const char* text, Vec2 pos, Vec2 size);
bool List(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Spinner(const char* id, const char* text, Vec2 pos, Vec2 size);
bool ColorPicker(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Hotkey(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Shape(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Radio(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Header(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Table(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Plot(const char* id, const char* text, Vec2 pos, Vec2 size);
bool TextArea(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Number(const char* id, const char* text, Vec2 pos, Vec2 size);
bool Custom(const char* id, const char* text, Vec2 pos, Vec2 size, void (*draw)(Area& a));

// Overlay-menu helpers used by generated menu.cpp. In this offline stub these
// are no-ops; a full runtime implements a toggleable in-game overlay menu.
bool Pressed(const char* key);
void BeginMenuWindow(const char* title);
void EndMenuWindow();
bool MenuTab(const char* name);
bool MenuToggle(const char* id, const char* label);
bool MenuSlider(const char* id, const char* label, float min, float max);
bool MenuCombo(const char* id, const char* label);
bool MenuButton(const char* id, const char* label);
void MenuLabel(const char* label);

// Optional platform hooks: host programs fill these in when a real backend
// is available. They are no-ops in the offline compatibility build.
struct Platform {
    bool windowed = true;
    bool wantClose = false;
    void* (*createTexture)(const unsigned char* rgba, int w, int h) = nullptr;
};
Platform& platform();

// ---------------------------------------------------------------------------
// Offline stub bodies (inline so no extra .cpp is needed for Export Source).
// A real shipped runtime replaces these with Dear ImGui drawing code.
// ---------------------------------------------------------------------------
inline Config& cfg() { static Config c; return c; }
inline Platform& platform() { static Platform p; return p; }
inline std::unordered_map<int, Asset>& assets() {
    static std::unordered_map<int, Asset> a; return a;
}
inline void AddAsset(int index, const unsigned char* data, int size) {
    assets()[index] = Asset{data, size};
}
inline void Init() {}
inline void Frame() {}
inline WidgetStyle& Def(const char* id) {
    static std::unordered_map<std::string, WidgetStyle> styles;
    return styles[id ? id : ""];
}
inline WidgetStyle& Def(const std::string& id) { return Def(id.c_str()); }
inline void AddPage(const char*, const char*, void (*)()) {}

inline std::unordered_map<std::string, std::string>& textState() {
    static std::unordered_map<std::string, std::string> s; return s;
}
inline bool GetBool(const char* id) { return textState()[id ? id : ""] == "true"; }
inline float GetFloat(const char* id) {
    try { return std::stof(textState()[id ? id : ""]); } catch (...) { return 0.0f; }
}
inline int GetInt(const char* id) {
    try { return std::stoi(textState()[id ? id : ""]); } catch (...) { return 0; }
}
inline std::string GetText(const char* id) { return textState()[id ? id : ""]; }
inline void Set(const char* id, const char* value) {
    if (id) textState()[id] = value ? value : "";
}

inline void GoTo(const char*) {}
inline void Toast(const char*, const char*) {}
inline void Load(const char*, float, const char*) {}
inline void Login(const char*, const char*, const char*, const char*, const char*, const char*) {}
inline void KeyLogin(const char*, const char*, const char*, const char*) {}
inline void Toggle(const char*) {}
inline void OpenUrl(const char*) {}
inline void Run(const char*) {}
inline void Copy(const char*) {}
inline void Minimize() {}
inline void Close() {}
inline void Fullscreen() {}

#define KAVRO_STUB_WIDGET(NAME) \
    inline bool NAME(const char*, const char*, Vec2, Vec2) { return false; }
KAVRO_STUB_WIDGET(Text)
KAVRO_STUB_WIDGET(Button)
KAVRO_STUB_WIDGET(Checkbox)
KAVRO_STUB_WIDGET(Switch)
KAVRO_STUB_WIDGET(Slider)
KAVRO_STUB_WIDGET(Input)
KAVRO_STUB_WIDGET(Combo)
KAVRO_STUB_WIDGET(Progress)
KAVRO_STUB_WIDGET(Separator)
KAVRO_STUB_WIDGET(Image)
KAVRO_STUB_WIDGET(Panel)
KAVRO_STUB_WIDGET(Tabs)
KAVRO_STUB_WIDGET(List)
KAVRO_STUB_WIDGET(Spinner)
KAVRO_STUB_WIDGET(ColorPicker)
KAVRO_STUB_WIDGET(Hotkey)
KAVRO_STUB_WIDGET(Shape)
KAVRO_STUB_WIDGET(Radio)
KAVRO_STUB_WIDGET(Header)
KAVRO_STUB_WIDGET(Table)
KAVRO_STUB_WIDGET(Plot)
KAVRO_STUB_WIDGET(TextArea)
KAVRO_STUB_WIDGET(Number)
#undef KAVRO_STUB_WIDGET

inline bool Custom(const char* id, const char* text, Vec2 pos, Vec2 size, void (*draw)(Area&)) {
    Area a{id, text, pos, size};
    if (draw) draw(a);
    return false;
}

// Offline overlay-menu stub bodies. A real build replaces these with ImGui calls.
inline bool Pressed(const char*) { return false; }
inline void BeginMenuWindow(const char*) {}
inline void EndMenuWindow() {}
inline bool MenuTab(const char*) { return false; }
inline bool MenuToggle(const char*, const char*) { return false; }
inline bool MenuSlider(const char*, const char*, float, float) { return false; }
inline bool MenuCombo(const char*, const char*) { return false; }
inline bool MenuButton(const char*, const char*) { return false; }
inline void MenuLabel(const char*) {}

} // namespace kv

// Defined by generated project.cpp; declared here so hosts can call it.
void KavroConfigure();

#endif // KAVRO_H_INCLUDED
