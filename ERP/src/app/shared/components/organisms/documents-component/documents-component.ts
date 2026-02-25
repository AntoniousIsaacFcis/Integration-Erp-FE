import { ChangeDetectionStrategy, Component, inject, output, Renderer2, signal } from '@angular/core';
import { IDocument } from '@shared/models/idocument';
import { TranslocoModule } from "@jsverse/transloco";

@Component({
  selector: 'app-documents-component',
  imports: [TranslocoModule],
  templateUrl: './documents-component.html',
  styleUrl: './documents-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {
  private renderer = inject(Renderer2);

  files = signal<IDocument[]>([]);
  onFilesChanged = output<IDocument[]>();

  getFiles() {
    return this.files();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      this.processFiles(droppedFiles);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }
  private processFiles(fileList: FileList) {
    const newFiles: IDocument[] = Array.from(fileList).map(file => ({
      file,
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
      type: file.type
    }));

    this.files.update(prev => [...prev, ...newFiles]);
    this.onFilesChanged.emit(this.files());
  }

  removeFile(index: number) {
    this.files.update(prev => prev.filter((_, i) => i !== index));
    this.onFilesChanged.emit(this.files());
  }
}
