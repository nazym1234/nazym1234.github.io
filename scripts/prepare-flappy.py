from pathlib import Path

source = Path('_flappy/flappybird.ml').read_text()
# Keep the original update/affiche functions; connect them to the browser engine.
source = source.replace('Random.float width', '(30.0 +. Random.float (width -. 40.0))')
source = source.replace('let _ = loop init_state update affiche',
    'let _ = loop ~reset:(fun () -> obstacles_generated := false) init_state update affiche')
Path('flappy/flappybird.ml').write_text(source)
