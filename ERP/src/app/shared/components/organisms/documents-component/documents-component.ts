import { ChangeDetectionStrategy, Component, inject, output, Renderer2, signal } from '@angular/core';
import { IDocument } from '@shared/models/idocument';
import { TranslocoModule } from "@jsverse/transloco";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideFileText, lucideRefreshCcw, lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-documents-component',
  imports: [TranslocoModule,NgIcon],
  templateUrl: './documents-component.html',
  styleUrl: './documents-component.css',
  providers:[provideIcons({lucideDownload,lucideRefreshCcw,lucideTrash2,lucideFileText})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {
  private renderer = inject(Renderer2);

  files = signal<IDocument[]>([]);
  onFilesChanged = output<IDocument[]>();

  readonly MAX_SIZE_MB = 10;
  readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];



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
    const fileArray = Array.from(fileList);

    const validFiles = fileArray.filter(file => {
      const isAllowedType = this.ALLOWED_TYPES.includes(file.type);
      const isAllowedSize = file.size <= this.MAX_SIZE_MB * 1024 * 1024;

      if (!isAllowedType) console.error(`File type ${file.type} not allowed`);
      if (!isAllowedSize) console.error(`File ${file.name} exceeds ${this.MAX_SIZE_MB}MB`);

      return isAllowedType && isAllowedSize;
    });

    const newFiles: IDocument[] = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
      type: file.type
    }));

    if (newFiles.length > 0) {
      this.files.update(prev => [...prev, ...newFiles]);
      this.onFilesChanged.emit(this.files());
    } else {
      // يمكنك إظهار Toast هنا للمستخدم يخبره أن الملفات المرفوضة لن تضاف
    }
  }

  removeFile(index: number) {
    this.files.update(prev => prev.filter((_, i) => i !== index));
    this.onFilesChanged.emit(this.files());
  }

   getPreviewUrl(doc: IDocument): string | null {
    if (doc.type.startsWith('image/')) {
      return URL.createObjectURL(doc.file);
    }
    return null;
  }

  downloadFile(doc: IDocument) {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

updateFile(index: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file && this.validateFile(file)) {
        const updatedDoc: IDocument = {
          file, name: file.name, size: file.size,
          uploadDate: new Date(), type: file.type
        };
        this.files.update(prev => {
          const newState = [...prev];
          newState[index] = updatedDoc;
          return newState;
        });
        this.onFilesChanged.emit(this.files());
      }
    };
    input.click();
  }

  private validateFile(file: File): boolean {
    return this.ALLOWED_TYPES.includes(file.type) && file.size <= this.MAX_SIZE_MB * 1024 * 1024;
  }
}
