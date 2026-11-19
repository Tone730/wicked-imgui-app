// Program.cs - LOCAL / OFFLINE COMPATIBILITY STUB entry point.
//
// Minimal host shape for exported C# projects. It deliberately does not create
// a Silk.NET window or ImGui.NET controller: the full-access runtime provides
// that. This file just shows where generated configuration and frames run.
// Keep the filename; the generator exports Program.cs for the csharp backend.

using System;
using KavroApp;

internal static class Program
{
    private static void Main()
    {
        // Generated Project.cs config + pages, then stub initialization.
        KavroConfigure.Configure();

        // Placeholder loop. A real host would run Silk.NET's event loop here,
        // call ImGui.NewFrame(), draw KavroUI pages, then ImGui.Render().
        for (int frame = 0; frame < 1; frame++)
        {
            Kv.Frame();
            // TODO(real host): window.DoEvents(); ImGui.NewFrame(); ... Render();
        }

        Console.WriteLine("[wicked] offline compatibility stub: nothing rendered.");
    }
}
