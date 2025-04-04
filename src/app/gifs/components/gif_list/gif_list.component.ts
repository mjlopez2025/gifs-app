import { Component, input } from '@angular/core';
import { GifListItemComponent } from "./gif-list-item/gif-list-item.component";
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'gif-list',
  imports: [GifListItemComponent],
  templateUrl: './gif_list.component.html',
})
export class GifListComponent {

  gifs = input.required<Gif[]>();

  get uniqueGifs(): Gif[] {
    return this.gifs().filter((gif, index, self) =>
      index === self.findIndex(g => g.id === gif.id)


    );
  }

}
