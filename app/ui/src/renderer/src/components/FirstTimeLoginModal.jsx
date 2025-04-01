import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Folder, Save } from "lucide-react"

export function FirstTimeLoginModal({ onComplete }) {
  const [documentsFolder, setDocumentsFolder] = useState("")
  const [passwordOption, setPasswordOption] = useState("same")
  const [newPassword, setNewPassword] = useState("")
  const [isSelectingFolder, setIsSelectingFolder] = useState(false)

  const handleFolderSelection = () => {
    // This would normally use an OS file dialog
    // For demo purposes, we'll simulate folder selection
    setIsSelectingFolder(true)
    setTimeout(() => {
      setDocumentsFolder("/Users/Documents/Proyecto")
      setIsSelectingFolder(false)
    }, 1000)
  }

  const handleSubmit = () => {
    // Save settings to localStorage
    localStorage.setItem("documentsFolder", documentsFolder)
    localStorage.setItem("passwordOption", passwordOption)

    if (passwordOption === "different" && newPassword) {
      // In a real app, this would be stored securely or sent to backend
      localStorage.setItem("appPassword", newPassword)
    }

    // Set scan folder for Header component
    localStorage.setItem("scanFolder", documentsFolder)

    // Call the completion callback
    onComplete()
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración inicial</DialogTitle>
          <DialogDescription>
            Vamos a configurar algunas opciones para mejorar su experiencia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="documents-folder">Carpeta de documentos</Label>
            <div className="flex space-x-2">
              <Input
                id="documents-folder"
                value={documentsFolder}
                onChange={e => setDocumentsFolder(e.target.value)}
                placeholder="Seleccione una carpeta"
                readOnly
              />
              <Button
                variant="outline"
                onClick={handleFolderSelection}
                disabled={isSelectingFolder}
              >
                <Folder className="h-4 w-4 mr-2" />
                {isSelectingFolder ? "Seleccionando..." : "Explorar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta será la carpeta principal donde se almacenarán los
              documentos.
            </p>
          </div>

          <div className="space-y-4">
            <Label>Contraseña de la aplicación</Label>
            <RadioGroup
              value={passwordOption}
              onValueChange={setPasswordOption}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="same-password" value="same" />
                <Label htmlFor="same-password" className="font-normal">
                  Usar la misma contraseña de mi cuenta
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="different-password" value="different" />
                <Label htmlFor="different-password" className="font-normal">
                  Usar una contraseña diferente
                </Label>
              </div>
            </RadioGroup>

            {passwordOption === "different" && (
              <div className="pt-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Ingrese nueva contraseña"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Guardar configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
