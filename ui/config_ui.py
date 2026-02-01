"""GUI configuration panel for the agent subsystem."""

import tkinter as tk
from tkinter import ttk


class ConfigWindow(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Agent Configuration")
        self._build_form()

    def _build_form(self) -> None:
        ttk.Label(self, text="Credentials").grid(column=0, row=0, sticky="w")
        ttk.Entry(self).grid(column=1, row=0)
        ttk.Entry(self, show="*").grid(column=1, row=1)
        ttk.Button(self, text="Save").grid(column=0, row=4, columnspan=2)


def run_ui() -> None:
    """Launch the streamlined config UI."""
    window = ConfigWindow()
    window.mainloop()
