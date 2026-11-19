//! main.rs - LOCAL / OFFLINE COMPATIBILITY STUB entry point for Rust exports.
//!
//! Minimal shape only: no imgui-rs context, glium display or winit event loop
//! is created here. The full-access runtime provides a complete host. This
//! file keeps Export Source / Build & Run working offline. Keep the filename.

mod kavro;

fn main() {
    // Generated project.rs settings would be applied inside this call in a
    // full build; here it returns the offline stub runtime state.
    let mut k = kavro::configure();
    k.init();

    // Placeholder loop. A real host would poll winit events, call
    // imgui::Context::frame(), draw the generated pages with `k`, then render.
    loop {
        k.frame();
        // TODO(real host): ctx.frame(); ui::page_*(...); renderer.render(...);
        break;
    }

    println!("[wicked] offline compatibility stub: nothing rendered.");
}
