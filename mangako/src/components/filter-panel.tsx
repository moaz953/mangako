"use client"

import { useState } from "react"
import { Filter, X, Grid3x3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type FilterOptions = {
    status: "all" | "completed" | "ongoing"
    sortBy: "newest" | "oldest" | "popular" | "rated"
    viewMode: "grid" | "list"
}

interface FilterPanelProps {
    filters: FilterOptions
    onFilterChange: (filters: FilterOptions) => void
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
    const hasActiveFilters = filters.status !== "all" || filters.sortBy !== "newest"

    const handleClearFilters = () => {
        onFilterChange({
            ...filters,
            status: "all",
            sortBy: "newest",
        })
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-1 px-1.5 min-w-5 h-5 flex items-center justify-center">
                                !
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => onFilterChange({ ...filters, status: "all" })}
                        className={filters.status === "all" ? "bg-accent" : ""}
                    >
                        All Stories
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onFilterChange({ ...filters, status: "ongoing" })}
                        className={filters.status === "ongoing" ? "bg-accent" : ""}
                    >
                        Ongoing
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onFilterChange({ ...filters, status: "completed" })}
                        className={filters.status === "completed" ? "bg-accent" : ""}
                    >
                        Completed
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => onFilterChange({ ...filters, sortBy: "newest" })}
                        className={filters.sortBy === "newest" ? "bg-accent" : ""}
                    >
                        Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onFilterChange({ ...filters, sortBy: "oldest" })}
                        className={filters.sortBy === "oldest" ? "bg-accent" : ""}
                    >
                        Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onFilterChange({ ...filters, sortBy: "popular" })}
                        className={filters.sortBy === "popular" ? "bg-accent" : ""}
                    >
                        Most Popular
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onFilterChange({ ...filters, sortBy: "rated" })}
                        className={filters.sortBy === "rated" ? "bg-accent" : ""}
                    >
                        Highest Rated
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
                <Button
                    variant={filters.viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onFilterChange({ ...filters, viewMode: "grid" })}
                    className="rounded-none"
                >
                    <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                    variant={filters.viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onFilterChange({ ...filters, viewMode: "list" })}
                    className="rounded-none"
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    )
}
