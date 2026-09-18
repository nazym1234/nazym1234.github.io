(* Browser compatibility engine for the original flappybird.ml. *)
open Js_of_ocaml
type key = Char of char
let width = 100.
let ( +.. ) (x,y) (a,b) = (x+.a,y+.b)
let gravity = (0., -45.)
let get_bounds s =
  let lines = String.split_on_char '\n' s in
  (float_of_int (List.fold_left (fun n s -> max n (String.length s)) 0 lines),
   float_of_int (List.length lines))
let ended = ref false
let won = ref false
let call name args = ignore (Js.Unsafe.fun_call (Js.Unsafe.get Js.Unsafe.global name) args)
let update_physics ((x,y),_) (vx,vy) forces solids =
  let ax,ay = List.fold_left ( +.. ) (0.,0.) forces in
  let vx,vy = vx+.ax/.30., vy+.ay/.30. in
  let nx,ny = x+.vx/.30., y+.vy/.30. in
  let hit = List.exists (fun ((sx,sy),text) ->
    if String.length text > 100 || sy > 30. then false else
    let w,h = get_bounds (String.trim text) in
    nx+.2. > sx && nx < sx+.w && ny+.1. > sy && ny < sy+.h
  ) solids in
  if ny <= 1. || ny >= 29. || hit then ended := true;
  if nx >= width -. 13. then (ended := true; won := true);
  ((nx,ny),(vx,vy),[])
let render state affiche =
  let grid = Array.init 31 (fun _ -> Bytes.make 100 ' ') in
  List.iter (fun ((x,y),text) ->
    String.split_on_char '\n' text |> List.iteri (fun row line ->
      String.iteri (fun col ch ->
        let gx = int_of_float x + col and gy = 30 - int_of_float y - row in
        if gx >= 0 && gx < 100 && gy >= 0 && gy < 31 && ch <> ' '
        then Bytes.set grid.(gy) gx ch) line)
  ) (List.rev (affiche state));
  let ((x,y),_,_) = state in
  let progress = min 100 (max 0 (int_of_float ((x-.10.)/.77.*.100.))) in
  let status = if !won then "won" else if !ended then "over" else "playing" in
  call "flappyRender" [|Js.Unsafe.inject (Js.string (String.concat "\n" (Array.to_list (Array.map Bytes.to_string grid))));
    Js.Unsafe.inject progress; Js.Unsafe.inject (Js.string status); Js.Unsafe.inject x; Js.Unsafe.inject y|]
let loop ~reset init update affiche =
  let state = ref init in
  let step code =
    if code = -1 then (reset (); state := init; ended := false; won := false)
    else if not !ended then (
      let key = if code = 0 then None else Some (Char (Char.chr code),false,false) in
      state := update !state key);
    render !state affiche
  in
  call "flappyInstall" [|Js.Unsafe.inject (Js.wrap_callback step)|];
  render !state affiche
