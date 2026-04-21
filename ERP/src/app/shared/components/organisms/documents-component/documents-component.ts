import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
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
  files = signal<IDocument[]>([]);
  onFilesChanged = output<IDocument[]>();

  maxSizeMb = input<number>(10);
  allowedMimeTypes = input<string[]>(['application/pdf', 'image/jpeg', 'image/png']);
  accept = input<string>('.pdf,.jpg,.jpeg,.png');

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

    const newFiles: IDocument[] = fileArray.map(file => ({
      file,
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
      type: file.type
    }));

    if (newFiles.length > 0) {
      // نقوم بإضافة كل الملفات (حتى غير الصالحة) ليتمكن المستخدم من إدارتها
      this.files.update(prev => [...prev, ...newFiles]);
      this.onFilesChanged.emit(this.files());
    }
  }

  isInvalid(doc: IDocument): boolean {
    const isAllowedType = this.allowedMimeTypes().includes(doc.type);
    const isAllowedSize = doc.size <= this.maxSizeMb() * 1024 * 1024;
    return !isAllowedType || !isAllowedSize;
  }

  removeFile(index: number) {
    this.files.update(prev => prev.filter((_, i) => i !== index));
    this.onFilesChanged.emit(this.files());
  }

   getPreviewUrl(doc: IDocument): string | null {
    if (doc.file instanceof File && doc.type.startsWith('image/')) {
      return URL.createObjectURL(doc.file);
    }
    return null;
  }

  downloadFile(doc: IDocument) {
    if (!(doc.file instanceof File)) {
      return;
    }
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
    input.accept = this.accept();
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
    return this.allowedMimeTypes().includes(file.type) && file.size <= this.maxSizeMb() * 1024 * 1024;
  }
}
