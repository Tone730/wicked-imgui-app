@echo off
setlocal
rem build.bat - LOCAL / OFFLINE COMPATIBILITY STUB build script.
rem Not a verified full Dear ImGui build: it exercises the Export Source path
rem and the {{...}} variable substitution only. Fill-in variables used here:
rem   {{EXE}}         output executable name
rem   {{GRAPHICS}}    backend label (informational)
rem   {{FLAGS}}       backend defines / include directories
rem   {{MARK}}        last ImGui backend source (informational)
rem   {{BACKEND_SRC}} ImGui backend .cpp files
rem   {{BACKEND_OBJ}} ImGui backend .obj files
rem   {{DEPS}}        optional GLFW / volk prebuild steps
rem   {{LIBS}}        graphics system libraries
rem This stub header carries inline bodies, so no KAVRO_IMPLEMENTATION unit
rem is required for this offline build.

echo [wicked] Building {{EXE}} - {{GRAPHICS}} (offline compatibility stub)
if not exist obj mkdir obj
if errorlevel 1 exit /b 1

{{DEPS}}

if "%IMGUI%"=="" set IMGUI=third_party\imgui

echo [wicked] Compiling generated project + stub host...
cl /nologo /O2 /MT /MP /W0 /DNDEBUG /DUNICODE /D_UNICODE /D_CRT_SECURE_NO_WARNINGS{{FLAGS}} /I. /I"%IMGUI%" /I"%IMGUI%\backends" /Foobj\ /c main.cpp project.cpp ui.cpp {{BACKEND_SRC}}
if errorlevel 1 exit /b 1

echo [wicked] Linking {{EXE}}.exe (backend: {{MARK}})...
link /nologo /OUT:{{EXE}}.exe obj\main.obj obj\project.obj obj\ui.obj {{BACKEND_OBJ}} {{LIBS}}
if errorlevel 1 exit /b 1

echo [wicked] Done: {{EXE}}.exe
endlocal
