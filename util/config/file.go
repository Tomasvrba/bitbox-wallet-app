package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
)

// directoryPath returns the absolute path to the application's directory.
func directoryPath() string {
	switch goos := runtime.GOOS; goos {
	case "darwin":
		return filepath.Join(os.Getenv("HOME"), "Library", "Application Support", "DBB")
	case "windows":
		return filepath.Join(os.Getenv("APPDATA"), "DBB")
	default:
		return filepath.Join(os.Getenv("HOME"), ".dbb")
	}
}

// File models a config file in the application's directory.
type File struct {
	name string
}

// NewFile creates a new config file with the given name in the application's directory.
func NewFile(name string) *File {
	return &File{name}
}

// path returns the absolute path to the config file.
func (file *File) path() string {
	return filepath.Join(directoryPath(), file.name)
}

// Exists checks whether the file exists with suitable permissions as a file and not as a directory.
func (file *File) Exists() bool {
	info, err := os.Stat(file.path())
	return err == nil && !info.IsDir()
}

// read reads the config file and returns its data (or an error if the config file does not exist).
func (file *File) read() ([]byte, error) {
	return ioutil.ReadFile(file.path())
}

// ReadJSON reads the config file as JSON to the given object. Make sure the config file exists!
func (file *File) ReadJSON(object interface{}) error {
	data, err := file.read()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, object)
}

// write writes the given data to the config file (and creates parent directories if necessary).
func (file *File) write(data []byte) error {
	if err := os.MkdirAll(directoryPath(), os.ModePerm); err != nil {
		return err
	}
	return ioutil.WriteFile(file.path(), data, 0600)
}

// WriteJSON writes the given object as JSON to the config file.
func (file *File) WriteJSON(object interface{}) error {
	data, err := json.Marshal(object)
	if err != nil {
		return err
	}
	return file.write(data)
}