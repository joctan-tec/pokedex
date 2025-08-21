{{- define "redis-ha.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "redis-ha.fullname" -}}
{{ .Release.Name }}-{{ .Chart.Name }}
{{- end }}
