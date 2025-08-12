import {AfterViewInit, Component, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";

import { Page } from "../page";

import {RouteService} from "../../services/route-service";
import {AudioService} from "../../services/audio-service";
import {serverAddress} from "../../utils";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent extends Page implements AfterViewInit {
  @ViewChild("allTags") private allTags!: ElementRef;

  @ViewChild("editTagItems") private editTagItems!: ElementRef;
  @ViewChild("editTagButtons") private editTagButtons!: ElementRef;
  @ViewChild("editTagConfirm") private editTagConfirm!: ElementRef;

  @ViewChild("createTagInput") private createTagInput!: ElementRef;
  @ViewChild("createTagError") private createTagError!: ElementRef;
  @ViewChild("createTagConfirm") private createTagConfirm!: ElementRef;

  @ViewChild("addFoodImage") private addFoodImage!: ElementRef;
  @ViewChild("addFoodError") private addFoodError!: ElementRef;
  @ViewChild("addFoodImageURL") private addFoodImageURL!: ElementRef;
  @ViewChild("addFoodVegetarian") private addFoodVegetarian!: ElementRef;
  @ViewChild("addFoodNonVegetarian") private addFoodNonVegetarian!: ElementRef;

  private tags: string[] = []
  private selectedTags: string[] = []
  private menu: [number, string][] = [];

  private imageLoaded = false;
  private isVegetarian = false;

  constructor(route: ActivatedRoute, routes: RouteService, audioService: AudioService) {
    super(route, routes, audioService);
  }

  ngAfterViewInit(): void { }

  protected async onPageRoute(params: Params): Promise<void> {
    await this.loadTagsMenu()
  }

  private async loadTagsMenu() : Promise<void> {
    const response = await fetch(`${serverAddress}/menu`, {
      method: 'GET',
      credentials: 'include',
    });

    const json = await response.json();

    const menu = json.menu;
    const editTagItemsParent = this.editTagItems.nativeElement
    for (let i = 0; i < menu.length; i++)
    {
      const name = menu[i].name;
      this.menu.push([menu[i].id, name]);

      const child = document.createElement("option")
      child.value = name;
      child.innerText = name

      editTagItemsParent.appendChild(child);
    }

    this.tags = json.tags
    const tagsParent = this.allTags.nativeElement
    const editTagsButtonsParent = this.editTagButtons.nativeElement

    if (this.tags.length == 0) {
      const div = document.createElement('div');
      div.className = 'w-100 text-center text-dark-emphasis p5';

      const heading = document.createElement('h4');
      heading.textContent = 'No Tags';
      div.appendChild(heading);

      tagsParent.appendChild(div);
      editTagsButtonsParent.appendChild(div.cloneNode(true));
    }
    else {
      for (let i = 0; i < this.tags.length; i++) {
        const tagElement = document.createElement("span")

        tagElement.innerText = this.tags[i]
        tagElement.className = 'p-2 rounded-2 text-center text-warning-emphasis text-bg-warning fw-bold ms-1 me-1'

        tagsParent.appendChild(tagElement)

        const tagButton = document.createElement("button")

        tagButton.disabled = true
        tagButton.innerText = this.tags[i]
        tagButton.className = 'btn text-warning fw-bold ms-1 me-1'

        tagButton.onclick = () => {
          this.toggleTag(this.tags[i], tagButton)
        }

        editTagsButtonsParent.appendChild(tagButton)
      }
    }

    const editTagsConfirmButton = this.editTagConfirm.nativeElement as HTMLButtonElement;
    const editTagItemsElement = this.editTagItems.nativeElement as HTMLSelectElement;

    editTagItemsElement.onchange = (e: Event) => {
      if (this.tags.length === 0)
        return

      const value = editTagItemsElement.value
      const item = menu.find((x: string) => x === value)

      if (item === undefined)
        return

      this.selectedTags.splice(0, this.selectedTags.length)

      const itemTags = item.tags
      for (let i = 0; i < editTagsButtonsParent.length; i++) {
        const button = editTagsButtonsParent[i]

        button.disabled = false
        const tag = button.dataset.tag

        if (itemTags.includes(tag)) {
          this.selectedTags.push(tag)
          button.classList = 'btn text-warning-emphasis text-bg-warning fw-bold ms-1 me-1'
        } else
          button.classList = 'btn text-warning fw-bold ms-1 me-1'
      }

      editTagsConfirmButton.disabled = false
      editTagsConfirmButton.onclick = async () => {
        const response = await fetch(`${serverAddress}/admin/food/updateTags/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            foodId: item.id,
            tags: this.selectedTags
          })
        })

        if (response.status == 200) {
          //reload page
        }

        //error in modal
      }
    }

    const createTagError = this.createTagError.nativeElement
    const createTagInput = this.createTagInput.nativeElement
    const createTagConfirm = this.createTagConfirm.nativeElement

    createTagConfirm.onclick = async () => {
      const value = createTagInput.value.trim().toLowerCase()

      if(!value) {
        createTagError.innerHTML = '*Tag is empty'
        return
      }

      if(this.tags.indexOf(value) >= 0) {
        createTagError.innerHTML = '*Tag already exists'
        return
      }

      const response = await fetch(`${serverAddress}/admin/tags/add/${value}`, {
        method: 'POST',
        headers: {
          'Accept' : 'application/json',
        }
      })

      if(response.status == 200){
        createTagInput.value = ''
      }

      //modal error
    }
  }

  private toggleTag(tag: string, button: HTMLButtonElement) : void{
    const index = this.selectedTags.indexOf(tag)

    if(index < 0)
    {
      this.selectedTags.push(tag)
      button.className = 'btn text-warning-emphasis text-bg-warning fw-bold ms-1 me-1'
    }
    else
    {
      this.selectedTags.splice(index, 1)
      button.className = 'btn text-warning fw-bold ms-1 me-1'
    }

    this.playClickSFX().then()
  }

  public setVegetarian() : void {
    this.isVegetarian = true

    this.addFoodVegetarian.nativeElement.className = 'btn text-success-emphasis text-bg-success fw-bold ms-1 me-1'
    this.addFoodNonVegetarian.nativeElement.className = 'btn text-danger fw-bold ms-1 me-1'

    this.playClickSFX().then()
  }

  public setNonVegetarian() : void {
    this.isVegetarian = false

    this.addFoodVegetarian.nativeElement.className = 'btn text-success fw-bold ms-1 me-1'
    this.addFoodNonVegetarian.nativeElement.className = 'btn text-danger-emphasis text-bg-danger fw-bold ms-1 me-1'

    this.playClickSFX().then()
  }

  public fetchImage() : void {
    this.imageLoaded = false
    this.addFoodError.nativeElement.innerHTML = ''

    this.playClickSFX().then()

    const value = this.addFoodImageURL.nativeElement.value
    if(!value)
    {
      this.addFoodError.nativeElement.innerHTML = "Empty URL"
      return
    }

    this.addFoodImage.nativeElement.src = value
    this.addFoodImage.nativeElement.onload = () => {
      this.imageLoaded = true
    }
  }

  public async addFoodConfirm() {
    this.addFoodError.nativeElement.innerHTML = ''

    const name = this.addFoodName.value
    const price = parseInt(addFoodPrice.value)
    const description = addFoodDescription.value

    if(!name || !description)
    {
      addFoodError.innerHTML = "Please enter a valid name, price and description"
      return
    }

    const hours = addFoodHours.value
    const minutes = addFoodMinutes.value
    const seconds = addFoodSeconds.value

    if(!hours || !minutes || !seconds)
    {
      addFoodError.innerHTML = "Please enter a time, make sure to fill hours, minutes and seconds"
      return
    }

    if(!parseInt(hours) && !parseInt(minutes) && !parseInt(seconds))
    {
      addFoodError.innerHTML = "Please enter a time, make sure to fill hours, minutes and seconds"
      return
    }

    if(!this.imageLoaded)
    {
      addFoodError.innerHTML = "No image loaded"
      return
    }

    const pad = (n: number) => String(n).padStart(2, '0');

    const response = await fetch('/admin/add/food', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        price: price,
        description: description,

        veg: this.isVegetarian,
        cookTime: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,

        image: this.addFoodImage.nativeElement.src
      })
    })

    if(response.status !== 200)
    {
      const json = await response.json()
      this.addFoodError.nativeElement.innerHTML = json.error
    }
  }
}
