# templates/_helpers.tpl
{{- define "freight-electrification-explorer.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "freight-electrification-explorer.fullname" -}}
{{ include "freight-electrification-explorer.name" . }}-release
{{- end }}
