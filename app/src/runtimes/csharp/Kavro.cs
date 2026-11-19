// Kavro.cs - LOCAL / OFFLINE COMPATIBILITY STUB (not the shipped runtime).
//
// This wrapper exists only so "Export Source" / "Build & Run" work offline in a
// local full-access build. It mirrors the public surface generated UI.cs,
// Project.cs and Program.cs expect, but performs no real ImGui drawing.
// The legacy Kavro*/Kv identifiers are generated-code contracts, not branding.
//
// New design-time widgets (badge, stat, rating, stepper, breadcrumb) are
// generated as calls to these existing methods, so no new API is required.

using System;
using System.Collections.Generic;
using System.Numerics;
using ImGuiNET;

namespace KavroApp;

public static partial class Kv
{
    public readonly struct Area
    {
        public readonly string Id;
        public readonly string Text;
        public readonly Vector2 Pos;
        public readonly Vector2 Size;

        public Area(string id, string text, Vector2 pos, Vector2 size)
        {
            Id = id;
            Text = text;
            Pos = pos;
            Size = size;
        }
    }

    public sealed class FontReq
    {
        public float size;
        public bool bold;
        public int family;
        public int asset;

        public FontReq(float size, bool bold, int family, int asset)
        {
            this.size = size;
            this.bold = bold;
            this.family = family;
            this.asset = asset;
        }
    }

    public sealed class Config
    {
        public sealed class WindowCfg
        {
            public int width = 1280, height = 720;
            public string title = "Wicked ImGui Maker";
            public bool borderless, resizable = true, topmost, centered = true;
            public float rounding = 8f, borderSize = 1f;
            public uint borderColor, bg = 0xff11151e, bg2;
            public int bgType, bgDir, bgImage = -1, openAnim, pageAnim, dragMode;
            public float bgImageOpacity = 1f, openDur = 0.3f, pageDur = 0.25f;
            public bool fullscreen, fsKey, animations = true;
        }

        public sealed class TitlebarCfg
        {
            public bool enabled = true, gradient, showTitle = true, titleBold;
            public float height = 32f, titleSize = 14f, iconSize = 16f;
            public uint bg, bg2, titleColor = 0xffffffff, btnColor, btnHover, closeHover, lineColor;
            public string title = "";
            public int align = 1, icon = -1, buttons, line;
            public bool showMinimize = true, showClose = true, draggable = true;
        }

        public sealed class BackgroundCfg
        {
            public int effect, count = 40;
            public float speed = 1f, size = 2f, opacity = 0.5f, linkDist = 120f;
            public uint color, color2;
            public bool mouse = true;
        }

        public sealed class ThemeCfg
        {
            public float fontSize = 14f;
            public int font, fontAsset = -1, toastPos;
            public uint toastBg, text = 0xffffffff, textDim = 0xff9ca3af;
            public uint accent = 0xff00e0b8, accent2 = 0xff8b5cf6;
            public uint frame = 0xff1c2230, border = 0xff2a3245;
        }

        public sealed class ToastCfg
        {
            public int area, pos, maxVisible = 4, anim, icon = -1, accent, align;
            public float offX = 12f, offY = 12f, duration = 3f, animDur = 0.25f;
            public bool progress, borderKind, shadow = true, bold;
            public uint bg, text = 0xffffffff, border, cInfo, cSuccess, cWarning, cError;
            public uint progressColor, outline, tshadow, shadowColor;
            public float width = 280f, height = 56f, padding = 12f, rounding = 8f;
            public float borderSize = 1f, gap = 8f, iconSize = 18f, fontSize = 13f;
            public float outlineSize, tshadowX, tshadowY, shadowSize = 8f;
        }

        public readonly WindowCfg window = new WindowCfg();
        public readonly TitlebarCfg titlebar = new TitlebarCfg();
        public readonly BackgroundCfg background = new BackgroundCfg();
        public readonly ThemeCfg theme = new ThemeCfg();
        public readonly ToastCfg toast = new ToastCfg();
        public List<FontReq> fonts = new List<FontReq>();
        public string startPage = "";
    }

    public sealed class WidgetStyle
    {
        public float opacity = 1f, animDelay, animDur = 0.4f, animSpeed = 1f;
        public float fontSize, rounding, borderSize, letterSpacing, outlineSize, tshadowX, tshadowY;
        public int anim, align, variant, gradDir, wrap, font, fontAsset = -1;
        public bool bold, underline, gradient, disabled, handCursor, noAnim;
        public uint color, color2, bg, bg2, bgHover, bgActive, text, textActive, border, outline, tshadow;
        public string visibleIf = "", enabledIf = "", tooltip = "", parent = "";
    }

    private static readonly Config cfgValue = new Config();
    private static readonly Dictionary<string, WidgetStyle> styles = new Dictionary<string, WidgetStyle>();
    private static readonly Dictionary<string, string> state = new Dictionary<string, string>();

    public static Config Cfg => cfgValue;

    public static WidgetStyle Def(string id)
    {
        if (!styles.TryGetValue(id ?? "", out var s))
        {
            s = new WidgetStyle();
            styles[id ?? ""] = s;
        }
        return s;
    }

    public static void AddPage(string id, string name, Action page) { /* offline stub: no window */ }
    public static void AddAsset(int index, byte[] data) { /* offline stub: no textures */ }
    public static uint Rgba(byte r, byte g, byte b, byte a) => (uint)((a << 24) | (b << 16) | (g << 8) | r);
    public static void Init() { }
    public static void Frame() { /* generated pages would draw here in a full build */ }

    public static bool GetBool(string id) => GetText(id) == "true";
    public static float GetFloat(string id) => float.TryParse(GetText(id), out var v) ? v : 0f;
    public static int GetInt(string id) => int.TryParse(GetText(id), out var v) ? v : 0;
    public static string GetText(string id) => state.TryGetValue(id ?? "", out var v) ? v : "";
    public static void Set(string id, string value) => state[id ?? ""] = value ?? "";

    public static void GoTo(string page) { }
    public static void Toast(string text, string kind) { }
    public static void Load(string target, float seconds, string page) { }
    public static void Login(string userField, string passField, string user, string pass, string page, string error) { }
    public static void KeyLogin(string keyField, string keys, string page, string error) { }
    public static void Toggle(string target) { }
    public static void OpenUrl(string url) { }
    public static void Run(string path) { }
    public static void Copy(string text) { }
    public static void Minimize() { }
    public static void Close() { }
    public static void Fullscreen() { }

    // Every design-time widget maps to one of these existing calls. All return
    // bool so `if (Kv.Button(...)) { ... }` generated actions still compile.
    public static bool Text(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Button(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Checkbox(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Switch(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Slider(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Input(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Combo(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Progress(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Separator(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Image(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Panel(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Tabs(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool List(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Spinner(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool ColorPicker(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Hotkey(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Shape(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Radio(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Header(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Table(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Plot(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool TextArea(string id, string text, Vector2 pos, Vector2 size) => false;
    public static bool Number(string id, string text, Vector2 pos, Vector2 size) => false;

    public static bool Custom(string id, string text, Vector2 pos, Vector2 size, Action<Area> draw)
    {
        draw?.Invoke(new Area(id, text, pos, size));
        return false;
    }

    // Overlay-menu helpers used by generated Menu.cs. No-ops in this offline
    // stub; a full build implements a toggleable in-game overlay menu.
    public static bool Pressed(string key) => false;
    public static void BeginMenuWindow(string title) { }
    public static void EndMenuWindow() { }
    public static bool MenuTab(string name) => false;
    public static bool MenuToggle(string id, string label) => false;
    public static bool MenuSlider(string id, string label, float min, float max) => false;
    public static bool MenuCombo(string id, string label) => false;
    public static bool MenuButton(string id, string label) => false;
    public static void MenuLabel(string label) { }
}

// Entry point used by Program.cs. Generated Project.cs supplies Configure().
public static class KavroConfigure
{
    public static void Configure()
    {
        KavroProject.Configure();
        Kv.Init();
    }
}
