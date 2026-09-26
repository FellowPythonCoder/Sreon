Unicode True
Name "Sreon"
OutFile "..\..\release\Sreon-Setup.exe"
InstallDir "$PROGRAMFILES64\Sreon"
RequestExecutionLevel user

Page directory
Page instfiles

Section "Sreon"
  SetOutPath "$INSTDIR"
  File "..\target\release\sreon.exe"
  CreateShortCut "$DESKTOP\Sreon.lnk" "$INSTDIR\sreon.exe"
  CreateDirectory "$SMPROGRAMS\Sreon"
  CreateShortCut "$SMPROGRAMS\Sreon\Sreon.lnk" "$INSTDIR\sreon.exe"
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\Sreon.lnk"
  Delete "$SMPROGRAMS\Sreon\Sreon.lnk"
  RMDir "$SMPROGRAMS\Sreon"
  Delete "$INSTDIR\sreon.exe"
  RMDir "$INSTDIR"
SectionEnd
