from pathlib import Path
p=Path("_game")
cargo=p/"Cargo.toml"
s=cargo.read_text().replace('rand = { version = "0.8", features = ["small_rng"] }','rand = { version = "0.8", default-features = false, features = ["small_rng"] }')
cargo.write_text(s)
main=p/"src/main.rs"
s=main.read_text().replace('use ::rand::thread_rng;',"""fn thread_rng() -> ::rand::rngs::SmallRng {
    use ::rand::SeedableRng;
    ::rand::rngs::SmallRng::seed_from_u64(macroquad::rand::rand() as u64)
}
#[cfg(target_arch = "wasm32")]
extern "C" { fn portfolio_ready(); }
""")
s=s.replace('static mut BEST_SCORE: u32 = 0;', 'static mut BEST_SCORE: u32 = 0;\n    macroquad::rand::srand((get_time() * 1_000_000.0) as u64);')
s=s.replace('let mut animated_background = AnimatedBackground::new().await;', 'let mut animated_background = AnimatedBackground::new().await;\n    #[cfg(target_arch = "wasm32")]\n    unsafe { portfolio_ready(); }')
s=s.replace('if is_key_down(KeyCode::Escape) {\n        return true;\n    }', '')
main.write_text(s)
a=p/"src/asteroid.rs"
a.write_text(a.read_text().replace('use ::rand::{thread_rng, Rng};','use ::rand::Rng;\nuse crate::thread_rng;'))
